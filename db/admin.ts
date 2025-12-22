import { AdminDashboardStats, SelectionsStats, UserRole, UsersStats } from "@/types/models";

import prisma from "@/lib/prisma";

export async function findAdminDashboardStats(): Promise<AdminDashboardStats> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [
        totalSelections,
        totalDrafts,
        totalUsers,
        newUsersThisWeek,
        notificationsSent
    ] = await Promise.all([
        prisma.massSelection.count(),

        prisma.massSelectionDraft.count(),
        prisma.user.count(),

        prisma.user.count({
            where: {
                createdAt: { gte: startOfWeek }
            }
        }),
        Promise.resolve(0)
    ]);

    return {
        totalSelections,
        totalDrafts,
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
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [
        totalSelections,
        totalPublicSelections,
        totalPrivateSelections,
        totalDrafts,
        newDraftsThisWeek,
        newSelectionsThisWeek
    ] = await Promise.all([
        prisma.massSelection.count(),
        prisma.massSelection.count({
            where: { isPublic: true }
        }),
        prisma.massSelection.count({
            where: { isPublic: false }
        }),
        prisma.massSelectionDraft.count(),
        prisma.massSelectionDraft.count({
            where: {
                createdAt: { gte: startOfWeek }
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
        totalDrafts,
        newDraftsThisWeek,
        newSelectionsThisWeek,
    };
}