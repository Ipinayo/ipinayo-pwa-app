import { CollaboratorRole, Prisma } from "@/lib/generated/prisma/client";

import prisma from "@/lib/prisma";

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

/** Member ids of a named group, for fanning out membership notifications. */
export async function findGroupMemberIds(groupId: string) {
  const members = await prisma.collaboratorGroupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
}
