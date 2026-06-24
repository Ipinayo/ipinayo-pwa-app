import { AdminDashboardStats, DraftStats, SelectionsStats, UserRole, UsersStats } from "@/types/models";
import { DraftSelectionFilter, SortDraftsBy, SortOrder } from "@/types/utils";

import { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

export async function findAdminDashboardStats(): Promise<AdminDashboardStats> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [
        totalSelections,
        newSelectionsThisWeek,
        totalDrafts,
        newDraftsThisWeek,
        totalUsers,
        newUsersThisWeek,
        notificationsSent
    ] = await Promise.all([
        prisma.massSelection.count(),
        prisma.massSelection.count({
            where: {
                createdAt: { gte: startOfWeek }
            }
        }),

        prisma.massSelectionDraft.count(),
        prisma.massSelectionDraft.count({
            where: {
                createdAt: { gte: startOfWeek }
            }
        }),
        prisma.user.count(),

        prisma.user.count({
            where: {
                createdAt: { gte: startOfWeek }
            }
        }),
        prisma.announcement.count(),
    ]);

    return {
        totalSelections,
        newSelectionsThisWeek,
        totalDrafts,
        newDraftsThisWeek,
        totalUsers,
        newUsersThisWeek,
        notificationsSent
    };
}

export async function findUsersStats(): Promise<UsersStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [
        totalUsers,
        totalAdmins,
        newUsersThisMonth,
        newUsersThisWeek,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
            where: {
                OR: [{
                    userRole: UserRole.ADMIN,

                }, { userRole: UserRole.SUPERADMIN }]
            }
        }),
        prisma.user.count({
            where: {
                createdAt: { gte: startOfMonth }
            }
        }),
        prisma.user.count({
            where: {
                createdAt: { gte: startOfWeek }
            }
        }),
    ]);

    return {
        totalUsers,
        totalAdmins,
        newUsersThisMonth,
        newUsersThisWeek,
    };
}

export async function findSelectionsStats(): Promise<SelectionsStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [
        totalSelections,
        totalPublicSelections,
        totalPrivateSelections,
        newSelectionsThisMonth,
        newSelectionsThisWeek
    ] = await Promise.all([
        prisma.massSelection.count(),
        prisma.massSelection.count({
            where: { isPublic: true }
        }),
        prisma.massSelection.count({
            where: { isPublic: false }
        }),
        prisma.massSelection.count({
            where: {
                createdAt: { gte: startOfMonth }
            }
        }),
        prisma.massSelection.count({
            where: {
                createdAt: { gte: startOfWeek }
            }
        }),
    ]);

    return {
        totalSelections,
        totalPublicSelections,
        totalPrivateSelections,
        newSelectionsThisMonth,
        newSelectionsThisWeek
    };
}

export async function findDraftsStats(): Promise<DraftStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15); // 15 days ago

    const [
        totalDrafts,
        newDraftsThisMonth,
        newDraftsThisWeek,
        oldDrafts
    ] = await Promise.all([
        prisma.massSelectionDraft.count(),
        prisma.massSelectionDraft.count({
            where: {
                createdAt: { gte: startOfMonth }
            }
        }),
        prisma.massSelectionDraft.count({
            where: {
                createdAt: { gte: startOfWeek }
            }
        }),
        prisma.massSelectionDraft.count({
            where: {
                updatedAt: {
                    lt: fifteenDaysAgo
                }
            },
        }),
    ]);

    return {
        totalDrafts,
        newDraftsThisMonth,
        newDraftsThisWeek,
        oldDrafts
    };
}

export async function updateUserAdminStatus(userId: string, isAdmin: boolean) {
    return await prisma.user.update({
        where: { id: userId, userRole: isAdmin ? UserRole.USER : UserRole.ADMIN },
        data: {
            userRole: isAdmin ? UserRole.ADMIN : UserRole.USER
        }
    })
}

export async function setUserFeaturedAuthor(userId: string, makeFeatured: boolean) {
    return await prisma.user.update({
        where: {
            id: userId,
            userRole: makeFeatured ? UserRole.USER : UserRole.FEATURED_AUTHOR,
        },
        data: {
            userRole: makeFeatured ? UserRole.FEATURED_AUTHOR : UserRole.USER,
        },
    })
}

export default async function findAllDrafts({
    page = 1,
    limit = 12,
    query = '',
    sortBy = SortDraftsBy.UPDATED_AT,
    sortOrder = SortOrder.DESC,
}: DraftSelectionFilter) {
    const skip = (page - 1) * limit

    // Build where clause with search and filter conditions
    const whereClause: Prisma.MassSelectionDraftWhereInput = {}

    // Build AND conditions array
    const andConditions: Prisma.MassSelectionDraftWhereInput[] = []

    // Add search functionality
    if (query) {
        andConditions.push({
            OR: [
                { title: { contains: query, mode: "insensitive" } },
                {
                    createdBy: {
                        name: { contains: query, mode: "insensitive" },
                    }
                },
                {
                    createdBy: {
                        email: { contains: query, mode: "insensitive" }
                    }
                },
            ],
        })
    }

    // Only add AND clause if there are conditions
    if (andConditions.length > 0) {
        whereClause.AND = andConditions
    }

    // Build order by clause
    const orderBy = {
        [sortBy]: sortOrder
    }

    // Get drafts with pagination
    const drafts = await prisma.massSelectionDraft.findMany({
        where: whereClause,
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            }
        },
        orderBy,
        skip,
        take: limit,
    })

    const total = await prisma.massSelectionDraft.count({
        where: whereClause,
    })

    return { drafts, total }
}

export async function deleteDraftById(draftId: string) {
    return await prisma.massSelectionDraft.delete({
        where: { id: draftId },
    })
}

export async function findDraftsExpiringSoon() {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15); // expiring threshold

    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20); // deletion threshold

    // Only the 15–20 day band: older than 15 days but not yet past the deletion
    // threshold, so a draft is never both "expiring" and "deleted" in one run.
    return await prisma.massSelectionDraft.findMany({
        where: {
            updatedAt: {
                lt: fifteenDaysAgo,
                gte: twentyDaysAgo,
            },
        }
    });
}

export async function deleteAllOldDrafts() {

    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20); // 20 days ago

    const where = {
        updatedAt: {
            lt: twentyDaysAgo
        }
    };

    const oldDrafts = await prisma.massSelectionDraft.findMany({
        where
    });

    await prisma.massSelectionDraft.deleteMany({
        where
    })

    return oldDrafts;
}

export async function findAllUserIds(): Promise<string[]> {
    const users = await prisma.user.findMany({ select: { id: true } });
    return users.map((u) => u.id);
}

export async function findAllAdminUserIds(): Promise<string[]> {
    const users = await prisma.user.findMany({
        where: { userRole: { in: [UserRole.ADMIN, UserRole.SUPERADMIN] } },
        select: { id: true },
    });
    return users.map((u) => u.id);
}

export async function findSuperAdminUserIds(): Promise<string[]> {
    const users = await prisma.user.findMany({
        where: { userRole: UserRole.SUPERADMIN },
        select: { id: true },
    });
    return users.map((u) => u.id);
}

export async function findAllUsersForSelect() {
    return await prisma.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
    });
}

export async function findAllActivities({
    page = 1,
    limit = 20,
    actorId,
    entityType,
    event,
}: {
    page?: number;
    limit?: number;
    actorId?: string;
    entityType?: string;
    event?: string;
} = {}) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ActivityWhereInput = {};
    const andConditions: Prisma.ActivityWhereInput[] = [];

    if (actorId) andConditions.push({ actorId });
    if (entityType) andConditions.push({ entityType });
    if (event) andConditions.push({ event });

    if (andConditions.length > 0) {
        whereClause.AND = andConditions;
    }

    const [activities, total] = await Promise.all([
        prisma.activity.findMany({
            where: whereClause,
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                recipients: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.activity.count({ where: whereClause }),
    ]);

    return { activities, total };
}