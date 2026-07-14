import { Prisma } from "@/lib/generated/prisma/client";

import prisma from "@/lib/prisma";

/** A comment always targets exactly one of a selection or a draft. */
export type CommentTarget =
  | { selectionId: string; draftId?: never }
  | { draftId: string; selectionId?: never };

const author = {
  select: { id: true, name: true, email: true, image: true },
} satisfies Prisma.UserDefaultArgs;

function targetWhere(target: CommentTarget): Prisma.CommentWhereInput {
  return "selectionId" in target
    ? { selectionId: target.selectionId }
    : { draftId: target.draftId };
}

export async function listComments(target: CommentTarget) {
  return prisma.comment.findMany({
    where: { ...targetWhere(target), parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      author,
      replies: { orderBy: { createdAt: "desc" }, include: { author } },
    },
  });
}

export async function countComments(target: CommentTarget) {
  return prisma.comment.count({
    where: { ...targetWhere(target), deletedAt: null },
  });
}

export async function findCommentById(id: string) {
  return prisma.comment.findUnique({
    where: { id },
    select: {
      id: true,
      authorId: true,
      parentId: true,
      selectionId: true,
      draftId: true,
      deletedAt: true,
      resolvedAt: true,
    },
  });
}

export async function createComment(params: {
  target: CommentTarget;
  authorId: string;
  body: string;
  parentId?: string | null;
  mentionedUserIds: string[];
}) {
  return prisma.comment.create({
    data: {
      selectionId: params.target.selectionId ?? null,
      draftId: params.target.draftId ?? null,
      authorId: params.authorId,
      body: params.body,
      parentId: params.parentId ?? null,
      mentionedUserIds: params.mentionedUserIds,
    },
    include: { author },
  });
}

export async function editComment(
  id: string,
  body: string,
  mentionedUserIds: string[],
) {
  return prisma.comment.update({
    where: { id },
    data: { body, mentionedUserIds, editedAt: new Date() },
    include: { author },
  });
}

export async function countCommentReplies(parentId: string) {
  return prisma.comment.count({ where: { parentId } });
}

export async function deleteComment(id: string) {
  return prisma.comment.delete({ where: { id } });
}

export async function softDeleteComment(id: string, deletedById: string) {
  return prisma.comment.update({
    where: { id },
    data: { deletedAt: new Date(), deletedById },
  });
}

export async function setCommentResolved(
  id: string,
  resolvedById: string,
  resolved: boolean,
) {
  return prisma.comment.update({
    where: { id },
    data: {
      resolvedAt: resolved ? new Date() : null,
      resolvedById: resolved ? resolvedById : null,
    },
  });
}

/**
 * Everyone who has posted in a thread (the top comment's author + every reply
 * author), for fanning out reply/resolve notifications. `topId` is the
 * top-level comment id.
 */
export async function findThreadParticipantIds(topId: string) {
  const rows = await prisma.comment.findMany({
    where: { OR: [{ id: topId }, { parentId: topId }] },
    select: { authorId: true },
  });
  return [...new Set(rows.map((r) => r.authorId))];
}
