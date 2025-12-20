import { AdminDashboardStats } from "@/types/models";
import prisma from "@/lib/prisma";

export async function findAdminDashboardStats(): Promise<AdminDashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [
        totalSelections,
        totalPublicSelections,
        totalPrivateSelections,
        totalDrafts,
        totalUsers,
        newUsersThisMonth,
        newUsersThisWeek,
        notificationsSent
    ] = await Promise.all([
        prisma.massSelection.count(),
        prisma.massSelection.count({
            where: { isPublic: true }
        }),
        prisma.massSelection.count({
            where: { isPublic: false }
        }),
        prisma.massSelectionDraft.count(),
        prisma.user.count(),
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
        Promise.resolve(0)
    ]);

    return {
        totalSelections,
        totalPublicSelections,
        totalPrivateSelections,
        totalDrafts,
        totalUsers,
        newUsersThisMonth,
        newUsersThisWeek,
        notificationsSent
    };
}