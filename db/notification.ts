import { NotificationStatus, Prisma } from "@/lib/generated/prisma/client";

import { CreateNotification } from "@/types/models";
import prisma from "@/lib/prisma";

export async function createNotification(data: CreateNotification) {
    return await prisma.notification.create({ data });
}

export async function createManyNotifications(data: CreateNotification[]) {
    return await prisma.notification.createMany({ data, skipDuplicates: true });
}

export async function findNotificationById(notificationId: string) {
    return await prisma.notification.findUnique({
        where: { id: notificationId },
        include: {
            activity: {
                include: {
                    actor: { select: { id: true, name: true, email: true } },
                    recipients: {
                        include: {
                            user: { select: { id: true, name: true, email: true } },
                        },
                    },
                },
            },
            user: { select: { id: true, name: true, email: true } },
        },
    });
}

export async function findNotificationsByUserId(
    userId: string,
    {
        page = 1,
        limit = 20,
        status,
    }: { page?: number; limit?: number; status?: NotificationStatus } = {}
) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.NotificationWhereInput = { userId };

    if (status) {
        whereClause.status = status;
    }

    const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
                activity: {
                    include: {
                        actor: { select: { id: true, name: true, email: true } },
                    },
                },
            },
        }),
        prisma.notification.count({ where: whereClause }),
    ]);

    return { notifications, total };
}

export async function findUnreadNotificationsByUserId(userId: string) {
    return await prisma.notification.findMany({
        where: { userId, status: NotificationStatus.UNREAD },
        orderBy: { createdAt: "desc" },
        include: {
            activity: {
                include: {
                    actor: { select: { id: true, name: true, email: true } },
                },
            },
        },
    });
}

export async function countUnreadNotifications(userId: string) {
    return await prisma.notification.count({
        where: { userId, status: NotificationStatus.UNREAD },
    });
}

export async function findNotificationsByActivityId(activityId: string) {
    return await prisma.notification.findMany({
        where: { activityId },
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
    });
}

export async function markNotificationAsRead(notificationId: string) {
    return await prisma.notification.update({
        where: { id: notificationId },
        data: {
            status: NotificationStatus.READ,
            readAt: new Date(),
        },
    });
}

export async function markAllNotificationsAsRead(userId: string) {
    return await prisma.notification.updateMany({
        where: { userId, status: NotificationStatus.UNREAD },
        data: {
            status: NotificationStatus.READ,
            readAt: new Date(),
        },
    });
}

export async function markAllNotificationsAsDismissed(userId: string) {
    return await prisma.notification.updateMany({
        where: {
            userId,
            status: { in: [NotificationStatus.UNREAD, NotificationStatus.READ] },
        },
        data: {
            status: NotificationStatus.DISMISSED,
            readAt: new Date(),
        },
    });
}

export async function markManyNotificationsAsRead(notificationIds: string[], userId: string) {
    return await prisma.notification.updateMany({
        where: {
            id: { in: notificationIds },
            userId,
            status: NotificationStatus.UNREAD,
        },
        data: {
            status: NotificationStatus.READ,
            readAt: new Date(),
        },
    });
}

export async function deleteAllDismissedNotifications(userId: string) {
    return await prisma.notification.deleteMany({
        where: { userId, status: NotificationStatus.DISMISSED },
    });
}

export async function findNotificationsByUserIdCursor(
    userId: string,
    { cursor, limit = 20 }: { cursor?: string; limit?: number }
) {
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
            activity: {
                include: {
                    actor: { select: { id: true, name: true, email: true } },
                },
            },
        },
    });

    const hasMore = notifications.length > limit;
    const items = hasMore ? notifications.slice(0, -1) : notifications;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { notifications: items, nextCursor, hasMore };
}