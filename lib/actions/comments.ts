"use server";

import {
  COMMENT_MAX,
  COMMENT_MIN,
  COMMENT_TOO_LONG,
  COMMENT_TOO_SHORT,
  CommentEntity,
  CreateCommentInput,
  DeleteCommentInput,
  EditCommentInput,
  ResolveCommentInput,
  createCommentSchema,
  deleteCommentSchema,
  editCommentSchema,
  resolveCommentSchema,
} from "@/types/schemas/comment";
import { htmlTextLength, sanitizeCommentHtml } from "@/lib/sanitize";
import { Permission, can } from "@/lib/collaboration-utils";
import {
  type CommentTarget,
  countCommentReplies,
  countComments,
  createComment as createCommentDb,
  deleteComment as deleteCommentDb,
  editComment as editCommentDb,
  findCommentById,
  findThreadParticipantIds,
  listComments,
  setCommentResolved,
  softDeleteComment,
} from "@/db/comments";
import {
  findDraftMeta,
  findDraftStakeholderIds,
  findSelectionMeta,
  findSelectionStakeholderIds,
} from "@/db/collaboration";
import {
  getDraftAccess,
  getDraftAccessPeople,
  getSelectionAccess,
  getSelectionAccessPeople,
} from "@/lib/actions/collaboration";
import { Comment, CommentView } from "@/types/models";

import { auth } from "@/auth";
import { createActivity } from "@/lib/notifications/dispatch";
import { getFieldError } from "@/lib/utils";
import { revalidatePath } from "next/cache";

const COMMENTED = {
  selection: "selection.commented",
  draft: "draft.commented",
} as const;

const MENTION = {
  selection: "selection.comment_mention",
  draft: "draft.comment_mention",
} as const;

function actorName(
  user: { name?: string | null; email?: string | null } | undefined,
) {
  return user?.name || user?.email || "Someone";
}

function entityTarget(entity: CommentEntity, entityId: string): CommentTarget {
  return entity === "selection"
    ? { selectionId: entityId }
    : { draftId: entityId };
}

function entityAccess(entity: CommentEntity, entityId: string, userId: string) {
  return entity === "selection"
    ? getSelectionAccess(entityId, userId)
    : getDraftAccess(entityId, userId);
}

async function entityMeta(entity: CommentEntity, entityId: string) {
  return entity === "selection"
    ? findSelectionMeta(entityId)
    : findDraftMeta(entityId);
}

async function entityStakeholderIds(entity: CommentEntity, entityId: string) {
  return entity === "selection"
    ? findSelectionStakeholderIds(entityId)
    : findDraftStakeholderIds(entityId);
}

/** Ids of everyone with access — the only people who may be @mentioned. */
async function entityAccessIds(entity: CommentEntity, entityId: string) {
  const people =
    entity === "selection"
      ? await getSelectionAccessPeople(entityId)
      : await getDraftAccessPeople(entityId);
  return new Set(people.map((p) => p.id));
}

/** The entity a comment belongs to, derived from which fk is set. */
function commentEntity(comment: {
  selectionId: string | null;
  draftId: string | null;
}): { entity: CommentEntity; entityId: string } | null {
  if (comment.selectionId)
    return { entity: "selection", entityId: comment.selectionId };
  if (comment.draftId) return { entity: "draft", entityId: comment.draftId };
  return null;
}

function revalidateEntity(entity: CommentEntity, entityId: string) {
  revalidatePath(
    entity === "selection"
      ? `/liturgical-selections/${entityId}`
      : `/liturgical-selections/new/${entityId}`,
  );
}

/** A reply row — a top-level Comment minus its own replies. */
type CommentReply = Comment["replies"][number];

/** Shared scalar mapping for a comment or reply (everything but nested replies). */
function baseView(c: CommentReply): Omit<CommentView, "replies"> {
  const deleted = c.deletedAt !== null;
  return {
    id: c.id,
    body: deleted ? null : c.body,
    author: deleted ? null : c.author,
    createdAt: c.createdAt,
    editedAt: c.editedAt,
    resolved: c.resolvedAt !== null,
    deleted,
    parentId: c.parentId,
  };
}

function toView(c: Comment): CommentView {
  return {
    ...baseView(c),
    replies: c.replies.map((r) => ({ ...baseView(r), replies: [] })),
  };
}

/** Threaded internal comments for an entity. Empty unless the viewer can view. */
export async function getComments(
  entity: CommentEntity,
  entityId: string,
): Promise<CommentView[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const access = await entityAccess(entity, entityId, session.user.id);
  if (!can(access, Permission.View)) return [];

  const rows = await listComments(entityTarget(entity, entityId));
  return rows.map(toView);
}

export async function getCommentCount(entity: CommentEntity, entityId: string) {
  const session = await auth();
  if (!session?.user?.id) return 0;
  const access = await entityAccess(entity, entityId, session.user.id);
  if (!can(access, Permission.View)) return 0;
  return countComments(entityTarget(entity, entityId));
}

export async function createComment(input: CreateCommentInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = createCommentSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const { entity, entityId, parentId, mentionedUserIds } = parsed.data;

    // Sanitize the rich-text HTML at the boundary, then validate visible length.
    const body = sanitizeCommentHtml(parsed.data.body);
    const len = htmlTextLength(body);
    if (len < COMMENT_MIN) throw new Error(COMMENT_TOO_SHORT);
    if (len > COMMENT_MAX) throw new Error(COMMENT_TOO_LONG);

    const access = await entityAccess(entity, entityId, session.user.id);
    if (!can(access, Permission.Comment)) {
      throw new Error("You don't have permission to comment here.");
    }

    // One level of threading: a reply to a reply re-parents to the top comment.
    let topParentId: string | null = null;
    if (parentId) {
      const parent = await findCommentById(parentId);
      const sameEntity =
        entity === "selection"
          ? parent?.selectionId === entityId
          : parent?.draftId === entityId;
      if (!parent || !sameEntity) {
        throw new Error("That comment can't be replied to.");
      }
      topParentId = parent.parentId ?? parent.id;
    }

    // Only people with access can be mentioned (bounds notification blast).
    const accessIds = await entityAccessIds(entity, entityId);
    const mentions = [...new Set(mentionedUserIds)].filter(
      (uid) => accessIds.has(uid) && uid !== session.user!.id,
    );

    const comment = await createCommentDb({
      target: entityTarget(entity, entityId),
      authorId: session.user.id,
      body,
      parentId: topParentId,
      mentionedUserIds: mentions,
    });

    // Notify: thread participants (reply) or all collaborators (new thread),
    // minus the actor and anyone getting a more-specific mention notification.
    const meta = await entityMeta(entity, entityId);
    const title = meta?.title || (entity === "draft" ? "Untitled draft" : "a selection");
    const actor = actorName(session.user);
    const mentionSet = new Set(mentions);

    const base = topParentId
      ? await findThreadParticipantIds(topParentId)
      : await entityStakeholderIds(entity, entityId);
    const commentedTargets = [...new Set(base)].filter(
      (uid) => uid !== session.user!.id && !mentionSet.has(uid),
    );

    if (commentedTargets.length > 0) {
      createActivity({
        targetUsers: commentedTargets,
        event: COMMENTED[entity],
        entityId,
        metadata: { title, actorName: actor },
        actorId: session.user.id,
      });
    }
    if (mentions.length > 0) {
      createActivity({
        targetUsers: mentions,
        event: MENTION[entity],
        entityId,
        metadata: { title, actorName: actor },
        actorId: session.user.id,
      });
    }

    revalidateEntity(entity, entityId);
    return { id: comment.id };
  } catch (error: any) {
    console.error("Error creating comment:", error);
    throw new Error(error?.message || "Error posting comment");
  }
}

export async function editComment(input: EditCommentInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = editCommentSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const comment = await findCommentById(parsed.data.commentId);
    if (!comment || comment.deletedAt) throw new Error("Comment not found.");
    if (comment.authorId !== session.user.id) {
      throw new Error("You can only edit your own comments.");
    }

    const target = commentEntity(comment);
    if (!target) throw new Error("Comment not found.");

    const access = await entityAccess(target.entity, target.entityId, session.user.id);
    if (!can(access, Permission.Comment)) {
      throw new Error("You don't have permission to comment here.");
    }

    const body = sanitizeCommentHtml(parsed.data.body);
    const len = htmlTextLength(body);
    if (len < COMMENT_MIN) throw new Error(COMMENT_TOO_SHORT);
    if (len > COMMENT_MAX) throw new Error(COMMENT_TOO_LONG);

    const accessIds = await entityAccessIds(target.entity, target.entityId);
    const mentions = [...new Set(parsed.data.mentionedUserIds)].filter(
      (uid) => accessIds.has(uid) && uid !== session.user!.id,
    );

    await editCommentDb(parsed.data.commentId, body, mentions);
    revalidateEntity(target.entity, target.entityId);
  } catch (error: any) {
    console.error("Error editing comment:", error);
    throw new Error(error?.message || "Error editing comment");
  }
}

export async function deleteComment(input: DeleteCommentInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = deleteCommentSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const comment = await findCommentById(parsed.data.commentId);
    if (!comment || comment.deletedAt) throw new Error("Comment not found.");

    const target = commentEntity(comment);
    if (!target) throw new Error("Comment not found.");

    const access = await entityAccess(target.entity, target.entityId, session.user.id);
    // Author can remove their own; a manager can moderate any.
    const isAuthor = comment.authorId === session.user.id;
    if (!isAuthor && !can(access, Permission.Manage)) {
      throw new Error("You can't remove this comment.");
    }

    // Tombstone if it has replies (keep the thread readable); hard-delete a leaf.
    const replies = await countCommentReplies(parsed.data.commentId);
    if (replies > 0) {
      await softDeleteComment(parsed.data.commentId, session.user.id);
    } else {
      await deleteCommentDb(parsed.data.commentId);
    }

    revalidateEntity(target.entity, target.entityId);
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    throw new Error(error?.message || "Error deleting comment");
  }
}

export async function resolveComment(input: ResolveCommentInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("You're not signed in.");

    const parsed = resolveCommentSchema.safeParse(input);
    if (!parsed.success) throw new Error(getFieldError(parsed.error.issues));

    const comment = await findCommentById(parsed.data.commentId);
    if (!comment) throw new Error("Comment not found.");

    const target = commentEntity(comment);
    if (!target) throw new Error("Comment not found.");

    // Resolve applies to the whole thread — resolve the top-level comment.
    const topId = comment.parentId ?? comment.id;
    const top = comment.parentId ? await findCommentById(topId) : comment;

    const access = await entityAccess(target.entity, target.entityId, session.user.id);
    const isAuthor = top?.authorId === session.user.id;
    if (!isAuthor && !can(access, Permission.Manage)) {
      throw new Error("You can't resolve this thread.");
    }

    await setCommentResolved(topId, session.user.id, parsed.data.resolved);
    revalidateEntity(target.entity, target.entityId);
  } catch (error: any) {
    console.error("Error resolving comment:", error);
    throw new Error(error?.message || "Error updating thread");
  }
}
