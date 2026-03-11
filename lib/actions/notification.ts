'use server';

import { NotificationStatus, Prisma } from "@/lib/generated/prisma";
import {
    countUnreadNotifications,
    createManyNotifications,
    createNotification,
    deleteAllDismissedNotifications,
    deleteNotificationById,
    findNotificationById,
    findNotificationsByActivityId,
    findNotificationsByUserId,
    findNotificationsByUserIdCursor,
    findUnreadNotificationsByUserId,
    markAllNotificationsAsDismissed,
    markAllNotificationsAsRead,
    markManyNotificationsAsRead,
    markNotificationAsDismissed,
    markNotificationAsRead,
} from "@/db/notification";

import { CreateNotification } from "@/types/models";
import { auth } from "@/auth";

export async function createNotificationAction(data: CreateNotification) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await createNotification(data);
    } catch (error: any) {
        console.error("Error creating notification:", error);
        throw new Error("Error creating notification: " + error?.message);
    }
}

export async function createManyNotificationsAction(data: Prisma.NotificationCreateManyInput[]) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await createManyNotifications(data);
    } catch (error: any) {
        console.error("Error creating notifications:", error);
        throw new Error("Error creating notifications: " + error?.message);
    }
}

export async function getNotificationById(notificationId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const notification = await findNotificationById(notificationId);
        if (!notification) {
            throw new Error("Notification not found");
        }

        return notification;
    } catch (error: any) {
        console.error("Error fetching notification:", error);
        throw new Error("Error fetching notification: " + error?.message);
    }
}

export async function getMyNotifications({
    page = 1,
    limit = 20,
    status,
}: { page?: number; limit?: number; status?: NotificationStatus } = {}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const { notifications, total } = await findNotificationsByUserId(session.user.id, {
            page,
            limit,
            status,
        });

        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error: any) {
        console.error("Error fetching notifications:", error);
        throw new Error("Error fetching notifications: " + error?.message);
    }
}

export async function getMyUnreadNotifications() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await findUnreadNotificationsByUserId(session.user.id);
    } catch (error: any) {
        console.error("Error fetching unread notifications:", error);
        throw new Error("Error fetching unread notifications: " + error?.message);
    }
}

export async function getMyUnreadNotificationsCount() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await countUnreadNotifications(session.user.id);
    } catch (error: any) {
        console.error("Error counting unread notifications:", error);
        throw new Error("Error counting unread notifications: " + error?.message);
    }
}

export async function getNotificationsByActivityId(activityId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await findNotificationsByActivityId(activityId);
    } catch (error: any) {
        console.error("Error fetching notifications by activity:", error);
        throw new Error("Error fetching notifications by activity: " + error?.message);
    }
}

export async function markNotificationAsReadAction(notificationId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await markNotificationAsRead(notificationId, session.user.id);
    } catch (error: any) {
        console.error("Error marking notification as read:", error);
        throw new Error("Error marking notification as read: " + error?.message);
    }
}

export async function markNotificationAsDismissedAction(notificationId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await markNotificationAsDismissed(notificationId, session.user.id);
    } catch (error: any) {
        console.error("Error dismissing notification:", error);
        throw new Error("Error dismissing notification: " + error?.message);
    }
}

export async function markAllNotificationsAsReadAction() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await markAllNotificationsAsRead(session.user.id);
    } catch (error: any) {
        console.error("Error marking all notifications as read:", error);
        throw new Error("Error marking all notifications as read: " + error?.message);
    }
}

export async function markAllNotificationsAsDismissedAction() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await markAllNotificationsAsDismissed(session.user.id);
    } catch (error: any) {
        console.error("Error dismissing all notifications:", error);
        throw new Error("Error dismissing all notifications: " + error?.message);
    }
}

export async function markManyNotificationsAsReadAction(notificationIds: string[]) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await markManyNotificationsAsRead(notificationIds, session.user.id);
    } catch (error: any) {
        console.error("Error marking notifications as read:", error);
        throw new Error("Error marking notifications as read: " + error?.message);
    }
}

export async function deleteNotificationByIdAction(notificationId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await deleteNotificationById(notificationId, session.user.id);
    } catch (error: any) {
        console.error("Error deleting notification:", error);
        throw new Error("Error deleting notification: " + error?.message);
    }
}

export async function deleteAllDismissedNotificationsAction() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await deleteAllDismissedNotifications(session.user.id);
    } catch (error: any) {
        console.error("Error deleting dismissed notifications:", error);
        throw new Error("Error deleting dismissed notifications: " + error?.message);
    }
}

export async function getMyNotificationsFeed({
    cursor,
    limit = 20,
}: { cursor?: string; limit?: number } = {}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await findNotificationsByUserIdCursor(session.user.id, { cursor, limit });
    } catch (error: any) {
        console.error("Error fetching notifications feed:", error);
        throw new Error("Error fetching notifications feed: " + error?.message);
    }
}