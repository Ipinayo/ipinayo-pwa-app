import { CollaboratorRole, Prisma } from "@/lib/generated/prisma/client";

import prisma from "@/lib/prisma";

type ClaimedInvitation = {
  groupId: string;
  role: CollaboratorRole;
  invitedById: string | null;
  inviterName: string;
  groupName: string | null;
  entity:
  | { type: "selection" | "draft"; id: string; title: string }
  | null;
};

const collaboratorUser = {
  select: { id: true, name: true, email: true, image: true },
} satisfies Prisma.UserDefaultArgs;

export async function listGroupMembers(groupId: string) {
  return prisma.collaboratorGroupMember.findMany({
    where: { groupId },
    include: { user: collaboratorUser },
    orderBy: { createdAt: "asc" },
  });
}

export async function upsertGroupMember(params: {
  groupId: string;
  userId: string;
  role: CollaboratorRole;
  invitedById: string;
}) {
  const { groupId, userId, role, invitedById } = params;
  return prisma.collaboratorGroupMember.upsert({
    where: { groupId_userId: { groupId, userId } },
    create: { groupId, userId, role, invitedById },
    update: { role },
    include: { user: collaboratorUser },
  });
}

export async function updateGroupMemberRole(
  groupId: string,
  userId: string,
  role: CollaboratorRole,
) {
  return prisma.collaboratorGroupMember.update({
    where: { groupId_userId: { groupId, userId } },
    data: { role },
  });
}

export async function removeGroupMember(groupId: string, userId: string) {
  return prisma.collaboratorGroupMember.deleteMany({
    where: { groupId, userId },
  });
}

export async function createNamedGroup(ownerId: string, name: string) {
  return prisma.collaboratorGroup.create({
    data: { name, ownerId },
  });
}

export async function renameGroup(groupId: string, name: string) {
  return prisma.collaboratorGroup.update({
    where: { id: groupId },
    data: { name },
  });
}

/**
 * Delete a named group. Each attached selection/draft is first re-pointed to a
 * fresh ad-hoc group containing only the owner (so no two entities end up
 * sharing a group), then the named group is deleted — which cascades and drops
 * every member row. Returns the affected member ids for notification.
 */
export async function deleteGroupAndReassign(groupId: string) {
  return prisma.$transaction(async (tx) => {
    const group = await tx.collaboratorGroup.findUnique({
      where: { id: groupId },
      select: {
        ownerId: true,
        members: { select: { userId: true } },
        selections: { select: { id: true } },
        drafts: { select: { id: true } },
      },
    });
    if (!group) return [];

    for (const s of group.selections) {
      const adhoc = await tx.collaboratorGroup.create({ data: { ownerId: group.ownerId } });
      await tx.massSelection.update({ where: { id: s.id }, data: { groupId: adhoc.id } });
    }
    for (const d of group.drafts) {
      const adhoc = await tx.collaboratorGroup.create({ data: { ownerId: group.ownerId } });
      await tx.massSelectionDraft.update({ where: { id: d.id }, data: { groupId: adhoc.id } });
    }

    // The named group no longer backs any entity; deleting it cascades members.
    await tx.collaboratorGroup.delete({ where: { id: groupId } });

    return group.members.map((m) => m.userId);
  });
}

export async function findGroupById(groupId: string) {
  return prisma.collaboratorGroup.findUnique({
    where: { id: groupId },
    select: { id: true, name: true, ownerId: true },
  });
}

export async function findGroupOwnerAndRole(groupId: string, userId: string) {
  const group = await prisma.collaboratorGroup.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      members: { where: { userId }, select: { role: true } },
    },
  });
  if (!group) return null;
  return {
    id: group.id,
    name: group.name,
    ownerId: group.ownerId,
    isOwner: group.ownerId === userId,
    memberRole: group.members[0]?.role ?? null,
  };
}

export async function findGroupWithMembers(groupId: string) {
  return prisma.collaboratorGroup.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      owner: collaboratorUser,
      members: {
        include: { user: collaboratorUser },
        orderBy: { createdAt: "asc" },
      },
      invitations: {
        select: { id: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { selections: true, drafts: true } },
    },
  });
}

export async function findGroupsForUser(userId: string) {
  return prisma.collaboratorGroup.findMany({
    where: {
      name: { not: null },
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: {
      id: true,
      name: true,
      ownerId: true,
      owner: collaboratorUser,
      members: {
        include: { user: collaboratorUser },
        orderBy: { createdAt: "asc" },
      },
      invitations: {
        select: { id: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { selections: true, drafts: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Named groups that may be attached to an entity owned by `selectionOwnerId`,
 * by an actor: the owner sees all their groups; a manager sees the owner's
 * groups they co-manage.
 */
export async function findAttachableGroups(
  actorId: string,
  selectionOwnerId: string,
) {
  return prisma.collaboratorGroup.findMany({
    where: {
      ownerId: selectionOwnerId,
      name: { not: null },
      OR: [
        { ownerId: actorId },
        { members: { some: { userId: actorId, role: CollaboratorRole.MANAGER } } },
      ],
    },
    select: {
      id: true,
      name: true,
      ownerId: true,
      _count: { select: { members: true } },
    },
    orderBy: { name: "asc" },
  });
}

/** Delete an ad-hoc group once nothing references it. Named groups are kept. */
async function cleanupOrphanedAdhocGroup(
  tx: Prisma.TransactionClient,
  groupId: string,
) {
  const group = await tx.collaboratorGroup.findUnique({
    where: { id: groupId },
    select: { name: true, _count: { select: { selections: true, drafts: true } } },
  });
  if (group?.name === null && group._count.selections === 0 && group._count.drafts === 0) {
    await tx.collaboratorGroup.delete({ where: { id: groupId } });
  }
}

export async function attachGroupToSelection(selectionId: string, groupId: string) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.massSelection.findUnique({
      where: { id: selectionId },
      select: { groupId: true },
    });
    if (!current) throw new Error("Selection not found.");
    if (current.groupId === groupId) return;

    await tx.massSelection.update({
      where: { id: selectionId },
      data: { groupId },
    });
    await cleanupOrphanedAdhocGroup(tx, current.groupId);
  });
}

export async function detachGroupFromSelection(selectionId: string) {
  return prisma.$transaction(async (tx) => {
    const selection = await tx.massSelection.findUnique({
      where: { id: selectionId },
      select: { groupId: true, createdById: true, group: { select: { name: true } } },
    });
    if (!selection) throw new Error("Selection not found.");

    // Already direct/ad-hoc — nothing to detach.
    if (selection.group.name === null) return;

    const adhoc = await tx.collaboratorGroup.create({
      data: { ownerId: selection.createdById },
    });
    await tx.massSelection.update({
      where: { id: selectionId },
      data: { groupId: adhoc.id },
    });
  });
}

export async function attachGroupToDraft(draftId: string, groupId: string) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.massSelectionDraft.findUnique({
      where: { id: draftId },
      select: { groupId: true },
    });
    if (!current) throw new Error("Draft not found.");
    if (current.groupId === groupId) return;

    await tx.massSelectionDraft.update({
      where: { id: draftId },
      data: { groupId },
    });
    await cleanupOrphanedAdhocGroup(tx, current.groupId);
  });
}

export async function detachGroupFromDraft(draftId: string) {
  return prisma.$transaction(async (tx) => {
    const draft = await tx.massSelectionDraft.findUnique({
      where: { id: draftId },
      select: { groupId: true, createdById: true, group: { select: { name: true } } },
    });
    if (!draft) throw new Error("Draft not found.");
    if (draft.group.name === null) return;

    const adhoc = await tx.collaboratorGroup.create({
      data: { ownerId: draft.createdById },
    });
    await tx.massSelectionDraft.update({
      where: { id: draftId },
      data: { groupId: adhoc.id },
    });
  });
}

export async function upsertInvitation(params: {
  groupId: string;
  email: string;
  role: CollaboratorRole;
  invitedById: string;
}) {
  const email = params.email.trim().toLowerCase();
  return prisma.collaboratorGroupInvitation.upsert({
    where: { groupId_email: { groupId: params.groupId, email } },
    create: {
      groupId: params.groupId,
      email,
      role: params.role,
      invitedById: params.invitedById,
    },
    update: { role: params.role },
  });
}

export async function listInvitations(groupId: string) {
  return prisma.collaboratorGroupInvitation.findMany({
    where: { groupId },
    select: { id: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function findInvitation(groupId: string, invitationId: string) {
  return prisma.collaboratorGroupInvitation.findFirst({
    where: { id: invitationId, groupId },
    select: { id: true, email: true, role: true },
  });
}

export async function deleteInvitation(groupId: string, invitationId: string) {
  return prisma.collaboratorGroupInvitation.deleteMany({
    where: { id: invitationId, groupId },
  });
}

/**
 * The pending invites waiting for an email, with a human label and inviter name.
 * Read while composing the magic-link email so its wording can name what's
 * waiting. A named group shows its name; an ad-hoc group shows its sole entity.
 */
export async function findPendingInvitationsForEmail(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();
  const invites = await prisma.collaboratorGroupInvitation.findMany({
    where: { email },
    select: {
      group: {
        select: {
          name: true,
          selections: { select: { title: true }, take: 1 },
          drafts: { select: { title: true }, take: 1 },
        },
      },
      invitedBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return invites.map((inv) => ({
    label:
      inv.group.name ||
      inv.group.selections[0]?.title ||
      inv.group.drafts[0]?.title ||
      "a collaboration",
    inviterName: inv.invitedBy?.name || inv.invitedBy?.email || "Someone",
  }));
}

/**
 * Convert every pending invite for `email` into a group membership for `userId`
 * and delete the invites, in one transaction. Email-scoped (not per-invite) so a
 * single sign-in claims invites across all groups at once.
 * Returns context for firing the access notifications.
 */
export async function claimInvitationsForUser(
  userId: string,
  rawEmail: string,
): Promise<ClaimedInvitation[]> {
  const email = rawEmail.trim().toLowerCase();
  return prisma.$transaction(async (tx) => {
    const invites = await tx.collaboratorGroupInvitation.findMany({
      where: { email },
      select: {
        groupId: true,
        role: true,
        invitedById: true,
        invitedBy: { select: { name: true, email: true } },
        group: {
          select: {
            name: true,
            selections: { select: { id: true, title: true }, take: 1 },
            drafts: { select: { id: true, title: true }, take: 1 },
          },
        },
      },
    });
    if (invites.length === 0) return [];

    for (const inv of invites) {
      await tx.collaboratorGroupMember.upsert({
        where: { groupId_userId: { groupId: inv.groupId, userId } },
        create: {
          groupId: inv.groupId,
          userId,
          role: inv.role,
          invitedById: inv.invitedById,
        },
        update: { role: inv.role },
      });
    }

    await tx.collaboratorGroupInvitation.deleteMany({ where: { email } });

    return invites.map((inv) => {
      const sel = inv.group.selections[0];
      const draft = inv.group.drafts[0];
      const entity = inv.group.name
        ? null
        : sel
          ? { type: "selection" as const, id: sel.id, title: sel.title }
          : draft
            ? {
              type: "draft" as const,
              id: draft.id,
              title: draft.title || "Untitled draft",
            }
            : null;
      return {
        groupId: inv.groupId,
        role: inv.role,
        invitedById: inv.invitedById,
        inviterName: inv.invitedBy?.name || inv.invitedBy?.email || "Someone",
        groupName: inv.group.name,
        entity,
      };
    });
  });
}

/** Member ids of a named group, for fanning out membership notifications. */
export async function findGroupMemberIds(groupId: string) {
  const members = await prisma.collaboratorGroupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
}
