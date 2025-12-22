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