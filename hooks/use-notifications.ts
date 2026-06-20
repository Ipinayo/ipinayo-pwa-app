"use client";

import { Notification, NotificationStatus } from "@/types/models";
import {
    deleteAllNotificationsAction,
    getMyNotificationsFeed,
    markNotificationAsReadAction,
} from "@/lib/actions/notification";
import { useCallback, useRef, useState } from "react";

interface UseNotificationsOptions {
    onUnreadUpdate?: (count: number) => void;
}

function countUnread(items: Notification[]) {
    return items.filter((n) => n.status === NotificationStatus.UNREAD).length;
}

export function useNotifications({ onUnreadUpdate }: UseNotificationsOptions = {}) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const isLoadingRef = useRef(false);

    const load = useCallback(async (cursor?: string) => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;
        setIsLoading(true);
        try {
            const result = await getMyNotificationsFeed({ cursor, limit: 20 });
            setNotifications((prev) =>
                cursor ? [...prev, ...result.notifications] : result.notifications
            );
            setNextCursor(result.nextCursor);
            setHasMore(result.hasMore);
            if (!cursor) {
                onUnreadUpdate?.(countUnread(result.notifications));
            }
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
        }
    }, [onUnreadUpdate]);

    const loadMore = useCallback(() => {
        if (hasMore && nextCursor && !isLoadingRef.current) {
            load(nextCursor);
        }
    }, [hasMore, nextCursor, load]);

    // Viewing a notification marks it read. 
    const markAsRead = useCallback(async (id: string) => {
        setNotifications((prev) => {
            const updated = prev.map((n) =>
                n.id === id && n.status === NotificationStatus.UNREAD
                    ? { ...n, status: NotificationStatus.READ, readAt: new Date() }
                    : n
            );
            onUnreadUpdate?.(countUnread(updated));
            return updated;
        });

        try {
            await markNotificationAsReadAction(id);
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            // The update didn't persist — re-sync from the server rather than
            // trusting a (possibly stale) local snapshot.
            load();
        }
    }, [onUnreadUpdate, load]);

    const clearAll = useCallback(async () => {
        setNotifications([]);
        onUnreadUpdate?.(0);

        try {
            await deleteAllNotificationsAction();
        } catch (error) {
            console.error("Failed to clear notifications:", error);
            load();
        }
    }, [onUnreadUpdate, load]);

    return {
        notifications,
        isLoading,
        hasMore,
        load,
        loadMore,
        markAsRead,
        clearAll,
    };
}
