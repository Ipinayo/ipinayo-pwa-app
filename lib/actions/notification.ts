'use server';

import {
    countUnreadNotifications,
    findNotificationsByUserIdCursor,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "@/db/notification";

import { auth } from "@/auth";

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

export async function markNotificationAsReadAction(notificationId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await markNotificationAsRead(notificationId);
    } catch (error: any) {
        console.error("Error marking notification as read:", error);
        throw new Error("Error marking notification as read: " + error?.message);
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