import { Prisma } from "@/lib/generated/prisma/client";

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
      group: {
        select: {
          id: true,
          name: true,
          ownerId: true,
          members: {
            include: { user: collaboratorUser },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
}

export async function findDraftAccessList(draftId: string) {
  return prisma.massSelectionDraft.findUnique({
    where: { id: draftId },
    select: {
      createdBy: collaboratorUser,
      group: {
        select: {
          id: true,
          name: true,
          ownerId: true,
          members: {
            include: { user: collaboratorUser },
            orderBy: { createdAt: "asc" },
          },
        },
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
    select: { createdById: true, isPublic: true, groupId: true },
  });

  if (!selection) return null;

  let role = null;
  if (userId && selection.createdById !== userId) {
    const member = await prisma.collaboratorGroupMember.findUnique({
      where: { groupId_userId: { groupId: selection.groupId, userId } },
      select: { role: true },
    });
    role = member?.role ?? null;
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
    select: { createdById: true, groupId: true },
  });
  if (!draft) return null;

  let role = null;
  if (userId && draft.createdById !== userId) {
    const member = await prisma.collaboratorGroupMember.findUnique({
      where: { groupId_userId: { groupId: draft.groupId, userId } },
      select: { role: true },
    });
    role = member?.role ?? null;
  }

  return { createdById: draft.createdById, role };
}

export async function findSelectionMeta(selectionId: string) {
  const selection = await prisma.massSelection.findUnique({
    where: { id: selectionId },
    select: { title: true, createdById: true, groupId: true, group: { select: { name: true } } },
  });
  if (!selection) return null;
  return {
    title: selection.title,
    createdById: selection.createdById,
    groupId: selection.groupId,
    groupName: selection.group.name,
  };
}

export async function findDraftMeta(draftId: string) {
  const draft = await prisma.massSelectionDraft.findUnique({
    where: { id: draftId },
    select: { title: true, createdById: true, groupId: true, group: { select: { name: true } } },
  });
  if (!draft) return null;
  return {
    title: draft.title,
    createdById: draft.createdById,
    groupId: draft.groupId,
    groupName: draft.group.name,
  };
}

export async function findSelectionStakeholderIds(selectionId: string) {
  const selection = await prisma.massSelection.findUnique({
    where: { id: selectionId },
    select: {
      createdById: true,
      group: { select: { members: { select: { userId: true } } } },
    },
  });
  if (!selection) return [];
  return [
    selection.createdById,
    ...selection.group.members.map((m) => m.userId),
  ];
}

export async function findDraftStakeholderIds(draftId: string) {
  const draft = await prisma.massSelectionDraft.findUnique({
    where: { id: draftId },
    select: {
      createdById: true,
      group: { select: { members: { select: { userId: true } } } },
    },
  });
  if (!draft) return [];
  return [draft.createdById, ...draft.group.members.map((m) => m.userId)];
}

export async function listSelectionCollaborators(selectionId: string) {
  const selection = await prisma.massSelection.findUnique({
    where: { id: selectionId },
    select: {
      group: {
        select: {
          members: {
            include: { user: collaboratorUser },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
  return selection?.group.members ?? [];
}

export async function listDraftCollaborators(draftId: string) {
  const draft = await prisma.massSelectionDraft.findUnique({
    where: { id: draftId },
    select: {
      group: {
        select: {
          members: {
            include: { user: collaboratorUser },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
  return draft?.group.members ?? [];
}

export async function findSelectionsSharedWith(
  userId: string,
  { page = 1, limit = 12 }: { page?: number; limit?: number } = {},
) {
  const skip = (page - 1) * limit;
  const where: Prisma.MassSelectionWhereInput = {
    createdById: { not: userId },
    group: { members: { some: { userId } } },
  };

  const [rows, total] = await Promise.all([
    prisma.massSelection.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: {
        themes: true,
        parishLocation: true,
        createdBy: { select: { name: true, email: true, userRole: true } },
        _count: { select: { parts: true } },
        group: { select: { members: { where: { userId }, select: { role: true } } } },
      },
    }),
    prisma.massSelection.count({ where }),
  ]);

  const selections = rows.map(({ group, ...selection }) => ({
    ...selection,
    sharedRole: group.members[0]?.role ?? null,
  }));
  return { selections, total };
}

export async function findDraftsSharedWith(
  userId: string,
  { page = 1, limit = 12 }: { page?: number; limit?: number } = {},
) {
  const skip = (page - 1) * limit;
  const where: Prisma.MassSelectionDraftWhereInput = {
    createdById: { not: userId },
    group: { members: { some: { userId } } },
  };

  const [rows, total] = await Promise.all([
    prisma.massSelectionDraft.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: {
        group: { select: { members: { where: { userId }, select: { role: true } } } },
      },
    }),
    prisma.massSelectionDraft.count({ where }),
  ]);

  const drafts = rows.map(({ group, ...draft }) => ({
    ...draft,
    sharedRole: group.members[0]?.role ?? null,
  }));
  return { drafts, total };
}
