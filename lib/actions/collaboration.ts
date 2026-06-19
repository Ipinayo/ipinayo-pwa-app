"use server";

import {
  AccessPerson,
  NO_ACCESS,
  OWNER_ACCESS,
  PUBLIC_VIEWER_ACCESS,
  Permission,
  can,
  getAccessForRole,
} from "@/lib/collaboration-utils";
import {
  changeRoleSchema,
  removeAccessSchema,
  shareSchema,
} from "@/types/schemas/collaboration";
import {
  findDraftAccessList,
  findDraftAccessRecord,
  findDraftMeta,
  findDraftsSharedWith,
  findSelectionAccessList,
  findSelectionAccessRecord,
  findSelectionMeta,
  findSelectionsSharedWith,
  listDraftCollaborators,
  listSelectionCollaborators,
  removeDraftCollaborator,
  removeSelectionCollaborator,
  searchUsers as searchUsersDb,
  updateDraftCollaboratorRole,
  updateSelectionCollaboratorRole,
  upsertDraftCollaborator,
  upsertSelectionCollaborator,
} from "@/db/collaborators";

import { auth } from "@/auth";
import { createActivity } from "@/lib/notifications/dispatch";
import { getFieldError } from "@/lib/utils";
import { revalidatePath } from "next/cache";

function actorName(
  user: { name?: string | null; email?: string | null } | undefined,
) {
  return user?.name || user?.email || "Someone";
}

export async function getSelectionAccess(
  selectionId: string,
  userId?: string | null,
) {
  const record = await findSelectionAccessRecord(selectionId, userId);
  if (!record) return NO_ACCESS;

  if (userId && record.createdById === userId) return OWNER_ACCESS;
  if (record.role) return getAccessForRole(record.role);
  if (record.isPublic) return PUBLIC_VIEWER_ACCESS;

  return NO_ACCESS;
}

export async function getDraftAccess(draftId: string, userId?: string | null) {
  if (!userId) return NO_ACCESS;

  const record = await findDraftAccessRecord(draftId, userId);
  if (!record) return NO_ACCESS;

  if (record.createdById === userId) return OWNER_ACCESS;
  if (record.role) return getAccessForRole(record.role);

  return NO_ACCESS;
}

export async function searchUsers(query: string) {
  const session = await auth();
  if (!session?.user?.id) return [];
  const q = query.trim();
  if (q.length < 2) return [];
  return searchUsersDb(q, [session.user.id], 8);
}

export async function getSelectionAccessPeople(
  id: string,
): Promise<AccessPerson[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const access = await getSelectionAccess(id, session.user.id);
  if (!access.isOwner && !access.role) return [];

  const data = await findSelectionAccessList(id);
  if (!data) return [];

  return [
    { ...data.createdBy, role: "OWNER", isOwner: true },
    ...data.collaborators.map((c) => ({ ...c.user, role: c.role, isOwner: false })),
  ];
}

export async function getDraftAccessPeople(id: string): Promise<AccessPerson[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const access = await getDraftAccess(id, session.user.id);
  if (!access.isOwner && !access.role) return [];

  const data = await findDraftAccessList(id);
  if (!data) return [];

  return [
    { ...data.createdBy, role: "OWNER", isOwner: true },
    ...data.collaborators.map((c) => ({ ...c.user, role: c.role, isOwner: false })),
  ];
}

export async function shareSelection(input: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = shareSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const { id, recipients, message } = parsed.data;

    const access = await getSelectionAccess(id, session.user.id);
    if (!can(access, Permission.Manage)) {
      throw new Error("You don't have permission to share this selection.");
    }

    const selection = await findSelectionMeta(id);
    if (!selection) throw new Error("Selection not found.");

    // Can't (re)add the owner or yourself.
    const targets = recipients.filter(
      (r) => r.userId !== selection.createdById && r.userId !== session.user!.id,
    );

    if (targets.length === 0) {
      throw new Error("Add at least one person to share with.");
    }

    await Promise.all(
      targets.map((t) =>
        upsertSelectionCollaborator({
          selectionId: id,
          userId: t.userId,
          role: t.role,
          invitedById: session.user!.id,
        }),
      ),
    );

    const actor = actorName(session.user);

    // Record an activity for each recipient. 
    targets.forEach((t) =>
      createActivity({
        targetUsers: [t.userId],
        event: "selection.shared_with_other",
        entityId: id,
        metadata: {
          title: selection.title,
          role: t.role,
          actorName: actor,
          ...(message ? { message } : {}),
        },
        actorId: session.user!.id,
      }),
    );

    // Record an activity for the sharer.
    createActivity({
      targetUsers: [session.user.id],
      event: "selection.shared_by_self",
      entityId: id,
      metadata: { title: selection.title, count: targets.length },
      actorId: session.user.id,
    });

    // When a manager (not the owner) shares, let the owner know.
    if (session.user.id !== selection.createdById) {
      createActivity({
        targetUsers: [selection.createdById],
        event: "selection.shared_by_other",
        entityId: id,
        metadata: { title: selection.title, actorName: actor, count: targets.length },
        actorId: session.user.id,
      });
    }

    revalidatePath(`/liturgical-selections/${id}`);
    revalidatePath("/dashboard");

    return { shared: targets.length };
  } catch (error: any) {
    console.error("Error sharing selection:", error);
    throw new Error(error?.message || "Error sharing selection");
  }
}

export async function changeSelectionRole(input: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = changeRoleSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));
    const { id, userId, role } = parsed.data;

    const access = await getSelectionAccess(id, session.user.id);
    if (!can(access, Permission.Manage)) {
      throw new Error("You don't have permission to change roles.");
    }

    const selection = await findSelectionMeta(id);
    if (!selection) throw new Error("Selection not found.");
    if (userId === selection.createdById) {
      throw new Error("The owner's role can't be changed.");
    }

    await updateSelectionCollaboratorRole(id, userId, role);

    createActivity({
      targetUsers: [userId],
      event: "selection.role_updated",
      entityId: id,
      metadata: {
        title: selection?.title ?? "a selection",
        role,
        actorName: actorName(session.user),
      },
      actorId: session.user.id,
    });

    revalidatePath(`/liturgical-selections/${id}`);
  } catch (error: any) {
    console.error("Error changing selection role:", error);
    throw new Error(error?.message || "Error changing role");
  }
}

export async function removeSelectionAccess(input: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = removeAccessSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const { id, userId } = parsed.data;

    const access = await getSelectionAccess(id, session.user.id);

    if (!can(access, Permission.Manage) && userId !== session.user.id) {
      throw new Error("You can't remove this collaborator.");
    }

    const selection = await findSelectionMeta(id);
    if (userId === selection?.createdById) {
      throw new Error("The owner's access can't be removed.");
    }

    await removeSelectionCollaborator(id, userId);

    if (userId !== session.user.id) {
      createActivity({
        targetUsers: [userId],
        event: "selection.access_revoked",
        entityId: id,
        metadata: {
          title: selection?.title ?? "a selection",
          actorName: actorName(session.user),
        },
        actorId: session.user.id,
      });
    }

    revalidatePath(`/liturgical-selections/${id}`);
    revalidatePath("/dashboard");
  } catch (error: any) {
    console.error("Error removing selection access:", error);
    throw new Error(error?.message || "Error removing collaborator");
  }
}

export async function getSelectionCollaborators(id: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const access = await getSelectionAccess(id, session.user.id);
  if (!can(access, Permission.View)) return [];

  return listSelectionCollaborators(id);
}

export async function shareDraft(input: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = shareSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const { id, recipients, message } = parsed.data;

    const access = await getDraftAccess(id, session.user.id);
    if (!can(access, Permission.Manage)) {
      throw new Error("You don't have permission to share this draft.");
    }

    const draft = await findDraftMeta(id);
    if (!draft) throw new Error("Draft not found.");
    const title = draft.title || "Untitled draft";

    const targets = recipients.filter(
      (r) => r.userId !== draft.createdById && r.userId !== session.user!.id,
    );
    if (targets.length === 0) {
      throw new Error("Add at least one person to share with.");
    }

    await Promise.all(
      targets.map((t) =>
        upsertDraftCollaborator({
          draftId: id,
          userId: t.userId,
          role: t.role,
          invitedById: session.user!.id,
        }),
      ),
    );

    const actor = actorName(session.user);
    targets.forEach((t) =>
      createActivity({
        targetUsers: [t.userId],
        event: "draft.shared_with_other",
        entityId: id,
        metadata: {
          title,
          role: t.role,
          actorName: actor,
          ...(message ? { message } : {}),
        },
        actorId: session.user!.id,
      }),
    );
    createActivity({
      targetUsers: [session.user.id],
      event: "draft.shared_by_self",
      entityId: id,
      metadata: { title, count: targets.length },
      actorId: session.user.id,
    });
    if (session.user.id !== draft.createdById) {
      createActivity({
        targetUsers: [draft.createdById],
        event: "draft.shared_by_other",
        entityId: id,
        metadata: { title, actorName: actor, count: targets.length },
        actorId: session.user.id,
      });
    }

    revalidatePath(`/liturgical-selections/new/${id}`);
    revalidatePath("/dashboard");

    return { shared: targets.length };
  } catch (error: any) {
    console.error("Error sharing draft:", error);
    throw new Error(error?.message || "Error sharing draft");
  }
}

export async function changeDraftRole(input: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = changeRoleSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const { id, userId, role } = parsed.data;

    const access = await getDraftAccess(id, session.user.id);
    if (!can(access, Permission.Manage)) {
      throw new Error("You don't have permission to change roles.");
    }

    const draft = await findDraftMeta(id);
    if (!draft) throw new Error("Draft not found.");
    if (userId === draft.createdById) {
      throw new Error("The owner's role can't be changed.");
    }

    await updateDraftCollaboratorRole(id, userId, role);

    createActivity({
      targetUsers: [userId],
      event: "draft.role_updated",
      entityId: id,
      metadata: {
        title: draft?.title || "a draft",
        role,
        actorName: actorName(session.user),
      },
      actorId: session.user.id,
    });

    revalidatePath(`/liturgical-selections/new/${id}`);
  } catch (error: any) {
    console.error("Error changing draft role:", error);
    throw new Error(error?.message || "Error changing role");
  }
}

export async function removeDraftAccess(input: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = removeAccessSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));
    const { id, userId } = parsed.data;

    const access = await getDraftAccess(id, session.user.id);
    if (!can(access, Permission.Manage) && userId !== session.user.id) {
      throw new Error("You can't remove this collaborator.");
    }

    const draft = await findDraftMeta(id);
    if (userId === draft?.createdById) {
      throw new Error("The owner's access can't be removed.");
    }

    await removeDraftCollaborator(id, userId);

    if (userId !== session.user.id) {
      createActivity({
        targetUsers: [userId],
        event: "draft.access_revoked",
        entityId: id,
        metadata: {
          title: draft?.title || "a draft",
          actorName: actorName(session.user),
        },
        actorId: session.user.id,
      });
    }

    revalidatePath(`/liturgical-selections/new/${id}`);
    revalidatePath("/dashboard");
  } catch (error: any) {
    console.error("Error removing draft access:", error);
    throw new Error(error?.message || "Error removing collaborator");
  }
}

export async function getDraftCollaborators(id: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const access = await getDraftAccess(id, session.user.id);
  if (!can(access, Permission.View)) return [];

  return listDraftCollaborators(id);
}

export async function getSharedSelections({
  page = 1,
  limit = 12,
}: { page?: number; limit?: number } = {}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { selections, total } = await findSelectionsSharedWith(
    session.user.id,
    { page, limit },
  );
  return {
    selections,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getSharedDrafts({
  page = 1,
  limit = 12,
}: { page?: number; limit?: number } = {}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { drafts, total } = await findDraftsSharedWith(session.user.id, {
    page,
    limit,
  });
  return {
    drafts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
