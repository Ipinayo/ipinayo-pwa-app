"use server";

import {
  AddGroupMembersInput,
  AttachGroupInput,
  ChangeGroupMemberRoleInput,
  CreateGroupInput,
  DeleteGroupInput,
  RemoveGroupMemberInput,
  RenameGroupInput,
  RevokeInvitationInput,
  ShareableRole,
  addGroupMembersSchema,
  attachGroupSchema,
  changeGroupMemberRoleSchema,
  createGroupSchema,
  deleteGroupSchema,
  removeGroupMemberSchema,
  renameGroupSchema,
  revokeInvitationSchema,
} from "@/types/schemas/collaboration";
import {
  Permission,
  can,
} from "@/lib/collaboration-utils";
import {
  attachGroupToDraft,
  attachGroupToSelection,
  claimInvitationsForUser,
  createInvitations,
  createNamedGroup,
  deleteGroupAndReassign,
  deleteInvitation,
  detachGroupFromDraft,
  detachGroupFromSelection,
  findGroupOwnerAndRole,
  findGroupWithMembers,
  findGroupsForUser,
  findInvitation,
  removeGroupMember as removeGroupMemberDb,
  renameGroup as renameGroupDb,
  updateGroupMemberRole,
  upsertGroupMember,
} from "@/db/collaborator-groups";
import { findDraftMeta, findSelectionMeta } from "@/db/collaboration";
import { getDraftAccess, getSelectionAccess } from "@/lib/actions/collaboration";

import { CollaboratorRole } from "@/lib/generated/prisma/client";
import { after } from "next/server";
import { auth } from "@/auth";
import { createActivity } from "@/lib/notifications/dispatch";
import { findUsers } from "@/db/user";
import { getFieldError } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { sendInviteMagicLinks } from "@/lib/notifications/invite-magic-link";

function actorName(
  user: { name?: string | null; email?: string | null } | undefined,
) {
  return user?.name || user?.email || "Someone";
}

/** Resolve the actor's standing on a group. Throws if the group is missing. */
async function resolveGroupRole(groupId: string, userId: string) {
  const group = await findGroupOwnerAndRole(groupId, userId);
  if (!group) throw new Error("Group not found.");
  const canManageMembers =
    group.isOwner || group.memberRole === CollaboratorRole.MANAGER;
  return { group, canManageMembers };
}

/**
 * An invited email that already belongs to an account joins directly (keeping
 * the role it was invited with) instead of being emailed a redundant magic link;
 * the rest stay as invites. Emails are lowercased to match stored addresses.
 */
async function splitInvites(
  inviteRecipients: { email: string; role: ShareableRole }[],
) {
  const invited = inviteRecipients.map((r) => ({
    email: r.email.trim().toLowerCase(),
    role: r.role,
  }));
  const existing = await findUsers(invited.map((i) => i.email));
  const idByEmail = new Map(existing.map((u) => [u.email, u.id]));

  const promoted = invited.flatMap((i) => {
    const userId = idByEmail.get(i.email);
    return userId ? [{ userId, role: i.role }] : [];
  });
  const invites = invited.filter((i) => !idByEmail.has(i.email));
  return { promoted, invites };
}

export async function getMyGroups() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const groups = await findGroupsForUser(session.user.id);
  return groups.map((g) => {
    const isOwner = g.ownerId === session.user!.id;
    const myRole =
      g.members.find((m) => m.user.id === session.user!.id)?.role ?? null;
    const canManageMembers = isOwner || myRole === CollaboratorRole.MANAGER;
    return {
      id: g.id,
      name: g.name ?? "",
      ownerId: g.ownerId,
      owner: g.owner,
      isOwner,
      canManageMembers,
      viewerId: session.user!.id,
      members: g.members.map((m) => ({ ...m.user, role: m.role })),
      // Pending invites expose email addresses — only managers see them.
      invitations: canManageMembers ? g.invitations : [],
      attachedCount: g._count.selections + g._count.drafts,
    };
  });
}

export async function getGroup(groupId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const group = await findGroupWithMembers(groupId);
  if (!group) return null;

  const memberRole =
    group.members.find((m) => m.userId === session.user!.id)?.role ?? null;
  const isOwner = group.ownerId === session.user.id;
  // Only the owner or a member may view the group.
  if (!isOwner && !memberRole) return null;

  const canManage = isOwner || memberRole === CollaboratorRole.MANAGER;
  return {
    id: group.id,
    name: group.name ?? "",
    ownerId: group.ownerId,
    owner: group.owner,
    isOwner,
    canManage,
    members: group.members.map((m) => ({ ...m.user, role: m.role })),
    invitations: canManage ? group.invitations : [],
    attachedCount: group._count.selections + group._count.drafts,
  };
}

export async function createGroup(input: CreateGroupInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = createGroupSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const group = await createNamedGroup(session.user.id, parsed.data.name);

    createActivity({
      targetUsers: [session.user.id],
      event: "collaboration.group_created_by_self",
      entityId: group.id,
      metadata: { groupName: parsed.data.name },
      actorId: session.user.id,
    });

    revalidatePath("/settings/groups");
    return { id: group.id };
  } catch (error: any) {
    console.error("Error creating group:", error);
    throw new Error(error?.message || "Error creating group");
  }
}

export async function renameGroup(input: RenameGroupInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = renameGroupSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const { group } = await resolveGroupRole(parsed.data.groupId, session.user.id);
    if (!group.isOwner) throw new Error("Only the group owner can rename it.");

    await renameGroupDb(parsed.data.groupId, parsed.data.name);

    revalidatePath("/settings/groups");
    revalidatePath(`/settings/groups/${parsed.data.groupId}`);
  } catch (error: any) {
    console.error("Error renaming group:", error);
    throw new Error(error?.message || "Error renaming group");
  }
}

export async function deleteGroup(input: DeleteGroupInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = deleteGroupSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const group = await findGroupWithMembers(parsed.data.groupId);
    if (!group) throw new Error("Group not found.");
    if (group.ownerId !== session.user.id) {
      throw new Error("Only the group owner can delete it.");
    }

    if (parsed.data.confirmName.trim() !== (group.name ?? "")) {
      throw new Error("The group name you typed doesn't match.");
    }

    // Each attached entity gets a fresh owner-only group; members lose access.
    await deleteGroupAndReassign(parsed.data.groupId);

    const actor = actorName(session.user);
    const groupName = group.name ?? "a group";

    createActivity({
      targetUsers: [session.user.id],
      event: "collaboration.group_deleted_by_self",
      entityId: group.id,
      metadata: { groupName },
      actorId: session.user.id,
    });

    group.members
      .filter((m) => m.userId !== session.user!.id)
      .forEach((m) =>
        createActivity({
          targetUsers: [m.userId],
          event: "collaboration.removed_from_group",
          entityId: group.id,
          metadata: { groupName, actorName: actor },
          actorId: session.user!.id,
        }),
      );

    revalidatePath("/settings/groups");
  } catch (error: any) {
    console.error("Error deleting group:", error);
    throw new Error(error?.message || "Error deleting group");
  }
}

export async function addGroupMembers(input: AddGroupMembersInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = addGroupMembersSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const { group, canManageMembers } = await resolveGroupRole(
      parsed.data.groupId,
      session.user.id,
    );
    if (!canManageMembers) {
      throw new Error("You don't have permission to add members to this group.");
    }

    // Invited emails that already have an account become direct members. The
    // owner is the implicit principal, never a member row; dedupe by user
    // (explicit picks win on role).
    const { promoted, invites: inviteTargets } = await splitInvites(
      parsed.data.inviteRecipients,
    );
    const byUser = new Map<string, ShareableRole>();
    for (const r of [...promoted, ...parsed.data.userRecipients]) {
      if (r.userId !== group.ownerId) byUser.set(r.userId, r.role);
    }
    const memberTargets = [...byUser].map(([userId, role]) => ({ userId, role }));
    if (memberTargets.length === 0 && inviteTargets.length === 0) {
      throw new Error("Add at least one person.");
    }

    await Promise.all(
      memberTargets.map((t) =>
        upsertGroupMember({
          groupId: group.id,
          userId: t.userId,
          role: t.role,
          invitedById: session.user!.id,
        }),
      ),
    );

    const actor = actorName(session.user);
    const groupName = group.name ?? "a group";
    memberTargets.forEach((t) =>
      createActivity({
        targetUsers: [t.userId],
        event: "collaboration.added_to_group",
        entityId: group.id,
        metadata: { groupName, role: t.role, actorName: actor },
        actorId: session.user!.id,
      }),
    );

    if (inviteTargets.length > 0) {
      await createInvitations({
        groupId: group.id,
        invitedById: session.user.id,
        recipients: inviteTargets,
      });

      // The invite IS the magic-link sign-in; claimed on first authentication.
      after(() =>
        sendInviteMagicLinks(
          inviteTargets.map((t) => t.email),
          "/settings/groups",
        ),
      );
    }

    revalidatePath("/settings/groups");
    revalidatePath(`/settings/groups/${group.id}`);
    return { added: memberTargets.length, invited: inviteTargets.length };
  } catch (error: any) {
    console.error("Error adding group members:", error);
    throw new Error(error?.message || "Error adding members");
  }
}

export async function changeGroupMemberRole(input: ChangeGroupMemberRoleInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = changeGroupMemberRoleSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const { group, canManageMembers } = await resolveGroupRole(
      parsed.data.groupId,
      session.user.id,
    );
    if (!canManageMembers) {
      throw new Error("You don't have permission to change roles in this group.");
    }
    if (parsed.data.userId === group.ownerId) {
      throw new Error("The owner's role can't be changed.");
    }

    await updateGroupMemberRole(group.id, parsed.data.userId, parsed.data.role);

    if (parsed.data.userId !== session.user.id) {
      createActivity({
        targetUsers: [parsed.data.userId],
        event: "collaboration.group_role_updated",
        entityId: group.id,
        metadata: {
          groupName: group.name ?? "a group",
          role: parsed.data.role,
          actorName: actorName(session.user),
        },
        actorId: session.user.id,
      });
    }

    revalidatePath("/settings/groups");
    revalidatePath(`/settings/groups/${group.id}`);
  } catch (error: any) {
    console.error("Error changing group member role:", error);
    throw new Error(error?.message || "Error changing role");
  }
}

export async function removeGroupMember(input: RemoveGroupMemberInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = removeGroupMemberSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const { group, canManageMembers } = await resolveGroupRole(
      parsed.data.groupId,
      session.user.id,
    );
    const isSelf = parsed.data.userId === session.user.id;
    if (!canManageMembers && !isSelf) {
      throw new Error("You don't have permission to remove members from this group.");
    }
    if (parsed.data.userId === group.ownerId) {
      throw new Error("The owner can't be removed from the group.");
    }

    await removeGroupMemberDb(group.id, parsed.data.userId);

    const groupName = group.name ?? "a group";
    if (isSelf) {
      // Record a self-activity for the person who left ("You left …").
      createActivity({
        targetUsers: [session.user.id],
        event: "collaboration.left_group_by_self",
        entityId: group.id,
        metadata: { groupName },
        actorId: session.user.id,
      });
      // Tell the owner that a member left (skip if the owner left their own group).
      if (group.ownerId !== session.user.id) {
        createActivity({
          targetUsers: [group.ownerId],
          event: "collaboration.left_group",
          entityId: group.id,
          metadata: { groupName, actorName: actorName(session.user) },
          actorId: session.user.id,
        });
      }
    } else {
      createActivity({
        targetUsers: [parsed.data.userId],
        event: "collaboration.removed_from_group",
        entityId: group.id,
        metadata: { groupName, actorName: actorName(session.user) },
        actorId: session.user.id,
      });
    }

    revalidatePath("/settings/groups");
    revalidatePath(`/settings/groups/${group.id}`);
  } catch (error: any) {
    console.error("Error removing group member:", error);
    throw new Error(error?.message || "Error removing member");
  }
}

export async function revokeInvitation(input: RevokeInvitationInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = revokeInvitationSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const { canManageMembers } = await resolveGroupRole(
      parsed.data.groupId,
      session.user.id,
    );
    if (!canManageMembers) {
      throw new Error("You don't have permission to manage invitations for this group.");
    }

    await deleteInvitation(parsed.data.groupId, parsed.data.invitationId);

    revalidatePath("/settings/groups");
    revalidatePath(`/settings/groups/${parsed.data.groupId}`);
  } catch (error: any) {
    console.error("Error revoking invitation:", error);
    throw new Error(error?.message || "Error revoking invitation");
  }
}

export async function resendInvitation(input: RevokeInvitationInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = revokeInvitationSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const { canManageMembers } = await resolveGroupRole(
      parsed.data.groupId,
      session.user.id,
    );
    if (!canManageMembers) {
      throw new Error("You don't have permission to manage invitations for this group.");
    }

    const invite = await findInvitation(parsed.data.groupId, parsed.data.invitationId);
    if (!invite) throw new Error("Invitation not found.");

    // Re-send the same magic link — the invite row is unchanged.
    await sendInviteMagicLinks([invite.email], "/settings/groups");
  } catch (error: any) {
    console.error("Error resending invitation:", error);
    throw new Error(error?.message || "Error resending invitation");
  }
}

async function assertAttachable(
  groupId: string,
  actorId: string,
  entityOwnerId: string,
) {
  const group = await findGroupOwnerAndRole(groupId, actorId);
  if (!group?.name) throw new Error("Group not found.");
  if (group.ownerId !== entityOwnerId) {
    throw new Error("That group belongs to a different owner.");
  }
  const canAttach =
    group.isOwner || group.memberRole === CollaboratorRole.MANAGER;
  if (!canAttach) throw new Error("You can't attach that group.");
  return group;
}

export async function attachSelectionGroup(input: AttachGroupInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = attachGroupSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const access = await getSelectionAccess(parsed.data.id, session.user.id);
    if (!can(access, Permission.Manage)) {
      throw new Error("You don't have permission to manage this selection.");
    }

    const meta = await findSelectionMeta(parsed.data.id);
    if (!meta) throw new Error("Selection not found.");

    const group = await assertAttachable(
      parsed.data.groupId,
      session.user.id,
      meta.createdById,
    );

    await attachGroupToSelection(parsed.data.id, parsed.data.groupId);

    // Notify the group's members that a selection was shared with them.
    const full = await findGroupWithMembers(parsed.data.groupId);
    const actor = actorName(session.user);
    full?.members
      .filter((m) => m.userId !== session.user!.id)
      .forEach((m) =>
        createActivity({
          targetUsers: [m.userId],
          event: "selection.shared_with_other",
          entityId: parsed.data.id,
          metadata: {
            title: meta.title,
            role: m.role,
            actorName: actor,
            message: `via the group "${group.name}"`,
          },
          actorId: session.user!.id,
        }),
      );

    revalidatePath(`/liturgical-selections/${parsed.data.id}`);
    revalidatePath(`/liturgical-selections/${parsed.data.id}/collaborators`);
    revalidatePath("/dashboard");
  } catch (error: any) {
    console.error("Error attaching group to selection:", error);
    throw new Error(error?.message || "Error attaching group");
  }
}

export async function detachSelectionGroup(input: Pick<AttachGroupInput, "id">) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = attachGroupSchema.pick({ id: true }).safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const access = await getSelectionAccess(parsed.data.id, session.user.id);
    if (!can(access, Permission.Manage)) {
      throw new Error("You don't have permission to manage this selection.");
    }

    // Capture the group's members BEFORE detaching.
    const meta = await findSelectionMeta(parsed.data.id);
    const losing =
      meta && meta.groupName !== null
        ? (await findGroupWithMembers(meta.groupId))?.members ?? []
        : [];

    await detachGroupFromSelection(parsed.data.id);

    const actor = actorName(session.user);
    losing
      .filter((m) => m.userId !== session.user!.id)
      .forEach((m) =>
        createActivity({
          targetUsers: [m.userId],
          event: "selection.access_revoked",
          entityId: parsed.data.id,
          metadata: { title: meta?.title ?? "a selection", actorName: actor },
          actorId: session.user!.id,
        }),
      );

    revalidatePath(`/liturgical-selections/${parsed.data.id}`);
    revalidatePath(`/liturgical-selections/${parsed.data.id}/collaborators`);
    revalidatePath("/dashboard");
  } catch (error: any) {
    console.error("Error detaching group from selection:", error);
    throw new Error(error?.message || "Error detaching group");
  }
}

export async function attachDraftGroup(input: AttachGroupInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = attachGroupSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const access = await getDraftAccess(parsed.data.id, session.user.id);
    if (!can(access, Permission.Manage)) {
      throw new Error("You don't have permission to manage this draft.");
    }

    const meta = await findDraftMeta(parsed.data.id);
    if (!meta) throw new Error("Draft not found.");

    const group = await assertAttachable(
      parsed.data.groupId,
      session.user.id,
      meta.createdById,
    );

    await attachGroupToDraft(parsed.data.id, parsed.data.groupId);

    const full = await findGroupWithMembers(parsed.data.groupId);
    const actor = actorName(session.user);
    const title = meta.title || "Untitled draft";
    full?.members
      .filter((m) => m.userId !== session.user!.id)
      .forEach((m) =>
        createActivity({
          targetUsers: [m.userId],
          event: "draft.shared_with_other",
          entityId: parsed.data.id,
          metadata: {
            title,
            role: m.role,
            actorName: actor,
            message: `via the group "${group.name}"`,
          },
          actorId: session.user!.id,
        }),
      );

    revalidatePath(`/liturgical-selections/new/${parsed.data.id}`);
    revalidatePath(`/liturgical-selections/new/${parsed.data.id}/collaborators`);
    revalidatePath("/dashboard");
  } catch (error: any) {
    console.error("Error attaching group to draft:", error);
    throw new Error(error?.message || "Error attaching group");
  }
}

export async function detachDraftGroup(input: Pick<AttachGroupInput, "id">) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = attachGroupSchema.pick({ id: true }).safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const access = await getDraftAccess(parsed.data.id, session.user.id);
    if (!can(access, Permission.Manage)) {
      throw new Error("You don't have permission to manage this draft.");
    }

    const meta = await findDraftMeta(parsed.data.id);
    const losing =
      meta && meta.groupName !== null
        ? (await findGroupWithMembers(meta.groupId))?.members ?? []
        : [];

    await detachGroupFromDraft(parsed.data.id);

    const actor = actorName(session.user);
    const title = meta?.title || "Untitled draft";
    losing
      .filter((m) => m.userId !== session.user!.id)
      .forEach((m) =>
        createActivity({
          targetUsers: [m.userId],
          event: "draft.access_revoked",
          entityId: parsed.data.id,
          metadata: { title, actorName: actor },
          actorId: session.user!.id,
        }),
      );

    revalidatePath(`/liturgical-selections/new/${parsed.data.id}`);
    revalidatePath(`/liturgical-selections/new/${parsed.data.id}/collaborators`);
    revalidatePath("/dashboard");
  } catch (error: any) {
    console.error("Error detaching group from draft:", error);
    throw new Error(error?.message || "Error detaching group");
  }
}

export async function claimPendingInvitationsAction(
  userId: string,
  email: string | null | undefined,
) {
  if (!email) return;

  const claimed = await claimInvitationsForUser(userId, email);

  for (const c of claimed) {
    const actorId = c.invitedById ?? userId;

    if (c.groupName) {
      createActivity({
        targetUsers: [userId],
        event: "collaboration.added_to_group",
        entityId: c.groupId,
        metadata: { groupName: c.groupName, role: c.role, actorName: c.inviterName },
        actorId,
      });
    } else if (c.entity?.type === "selection") {
      createActivity({
        targetUsers: [userId],
        event: "selection.shared_with_other",
        entityId: c.entity.id,
        metadata: { title: c.entity.title, role: c.role, actorName: c.inviterName },
        actorId,
      });
    } else if (c.entity?.type === "draft") {
      createActivity({
        targetUsers: [userId],
        event: "draft.shared_with_other",
        entityId: c.entity.id,
        metadata: { title: c.entity.title, role: c.role, actorName: c.inviterName },
        actorId,
      });
    }
  }
}