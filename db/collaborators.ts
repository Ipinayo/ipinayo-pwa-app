import "server-only";

import { CollaboratorRole, Prisma } from "@/lib/generated/prisma/client";

import prisma from "@/lib/prisma";


const collaboratorUser = {
  select: { id: true, name: true, email: true, image: true },
} satisfies Prisma.UserDefaultArgs;

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, name: true, email: true, image: true },
  });
}

export async function searchUsers(
  query: string,
  excludeIds: string[] = [],
  limit = 8,
) {
  return prisma.user.findMany({
    where: {
      id: { notIn: excludeIds },
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true, image: true },
    take: limit,
  });
}

export async function findSelectionAccessList(selectionId: string) {
  return prisma.massSelection.findUnique({
    where: { id: selectionId },
    select: {
      createdBy: collaboratorUser,
      collaborators: {
        include: { user: collaboratorUser },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function findDraftAccessList(draftId: string) {
  return prisma.massSelectionDraft.findUnique({
    where: { id: draftId },
    select: {
      createdBy: collaboratorUser,
      collaborators: {
        include: { user: collaboratorUser },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function findSelectionAccessRecord(
  selectionId: string,
  userId?: string | null,
) {
  const selection = await prisma.massSelection.findUnique({
    where: { id: selectionId },
    select: { createdById: true, isPublic: true },
  });

  if (!selection) return null;

  let role: CollaboratorRole | null = null;
  if (userId && selection.createdById !== userId) {
    const collaborator = await prisma.selectionCollaborator.findUnique({
      where: { selectionId_userId: { selectionId, userId } },
      select: { role: true },
    });
    role = collaborator?.role ?? null;
  }

  return {
    createdById: selection.createdById,
    isPublic: selection.isPublic,
    role,
  };
}

export async function findDraftAccessRecord(
  draftId: string,
  userId?: string | null,
) {
  const draft = await prisma.massSelectionDraft.findUnique({
    where: { id: draftId },
    select: { createdById: true },
  });
  if (!draft) return null;

  let role: CollaboratorRole | null = null;
  if (userId && draft.createdById !== userId) {
    const collaborator = await prisma.draftCollaborator.findUnique({
      where: { draftId_userId: { draftId, userId } },
      select: { role: true },
    });
    role = collaborator?.role ?? null;
  }

  return { createdById: draft.createdById, role };
}

export async function findSelectionMeta(selectionId: string) {
  return prisma.massSelection.findUnique({
    where: { id: selectionId },
    select: { title: true, createdById: true },
  });
}

export async function findDraftMeta(draftId: string) {
  return prisma.massSelectionDraft.findUnique({
    where: { id: draftId },
    select: { title: true, createdById: true },
  });
}

export async function findSelectionStakeholderIds(selectionId: string) {
  const selection = await prisma.massSelection.findUnique({
    where: { id: selectionId },
    select: { createdById: true, collaborators: { select: { userId: true } } },
  });
  if (!selection) return [];
  return [
    selection.createdById,
    ...selection.collaborators.map((c) => c.userId),
  ];
}

export async function findDraftStakeholderIds(draftId: string) {
  const draft = await prisma.massSelectionDraft.findUnique({
    where: { id: draftId },
    select: { createdById: true, collaborators: { select: { userId: true } } },
  });
  if (!draft) return [];
  return [draft.createdById, ...draft.collaborators.map((c) => c.userId)];
}

export async function listSelectionCollaborators(selectionId: string) {
  return prisma.selectionCollaborator.findMany({
    where: { selectionId },
    include: { user: collaboratorUser },
    orderBy: { createdAt: "asc" },
  });
}

export async function upsertSelectionCollaborator(params: {
  selectionId: string;
  userId: string;
  role: CollaboratorRole;
  invitedById: string;
}) {
  const { selectionId, userId, role, invitedById } = params;
  return prisma.selectionCollaborator.upsert({
    where: { selectionId_userId: { selectionId, userId } },
    create: { selectionId, userId, role, invitedById },
    update: { role },
    include: { user: collaboratorUser },
  });
}

export async function updateSelectionCollaboratorRole(
  selectionId: string,
  userId: string,
  role: CollaboratorRole,
) {
  return prisma.selectionCollaborator.update({
    where: { selectionId_userId: { selectionId, userId } },
    data: { role },
  });
}

export async function removeSelectionCollaborator(
  selectionId: string,
  userId: string,
) {
  return prisma.selectionCollaborator.deleteMany({
    where: { selectionId, userId },
  });
}

export async function findSelectionsSharedWith(
  userId: string,
  { page = 1, limit = 12 }: { page?: number; limit?: number } = {},
) {
  const skip = (page - 1) * limit;
  const where: Prisma.SelectionCollaboratorWhereInput = { userId };

  const [rows, total] = await Promise.all([
    prisma.selectionCollaborator.findMany({
      where,
      orderBy: { selection: { updatedAt: "desc" } },
      skip,
      take: limit,
      select: {
        role: true,
        selection: {
          include: {
            themes: true,
            parishLocation: true,
            createdBy: { select: { name: true, email: true, userRole: true } },
            _count: { select: { parts: true } },
          },
        },
      },
    }),
    prisma.selectionCollaborator.count({ where }),
  ]);

  const selections = rows.map((r) => ({ ...r.selection, sharedRole: r.role }));
  return { selections, total };
}

export async function listDraftCollaborators(draftId: string) {
  return prisma.draftCollaborator.findMany({
    where: { draftId },
    include: { user: collaboratorUser },
    orderBy: { createdAt: "asc" },
  });
}

export async function upsertDraftCollaborator(params: {
  draftId: string;
  userId: string;
  role: CollaboratorRole;
  invitedById: string;
}) {
  const { draftId, userId, role, invitedById } = params;
  return prisma.draftCollaborator.upsert({
    where: { draftId_userId: { draftId, userId } },
    create: { draftId, userId, role, invitedById },
    update: { role },
    include: { user: collaboratorUser },
  });
}

export async function updateDraftCollaboratorRole(
  draftId: string,
  userId: string,
  role: CollaboratorRole,
) {
  return prisma.draftCollaborator.update({
    where: { draftId_userId: { draftId, userId } },
    data: { role },
  });
}

export async function removeDraftCollaborator(draftId: string, userId: string) {
  return prisma.draftCollaborator.deleteMany({ where: { draftId, userId } });
}

export async function findDraftsSharedWith(
  userId: string,
  { page = 1, limit = 12 }: { page?: number; limit?: number } = {},
) {
  const skip = (page - 1) * limit;
  const where: Prisma.DraftCollaboratorWhereInput = { userId };

  const [rows, total] = await Promise.all([
    prisma.draftCollaborator.findMany({
      where,
      orderBy: { draft: { updatedAt: "desc" } },
      skip,
      take: limit,
      select: { role: true, draft: true },
    }),
    prisma.draftCollaborator.count({ where }),
  ]);

  const drafts = rows.map((r) => ({ ...r.draft, sharedRole: r.role }));
  return { drafts, total };
}
