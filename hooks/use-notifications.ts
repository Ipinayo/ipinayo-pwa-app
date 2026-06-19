"use client";

import { useCallback, useRef, useState } from "react";

import { Notification, NotificationStatus } from "@/types/models";
import {
    deleteAllNotificationsAction,
    deleteNotificationAction,
    getMyNotificationsFeed,
} from "@/lib/actions/notification";

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

    // A notification is removed once viewed; the activity remains on the
    // activities page.
    const remove = useCallback(async (id: string) => {
        const prev = notifications;
        const updated = prev.filter((n) => n.id !== id);
        setNotifications(updated);
        onUnreadUpdate?.(countUnread(updated));

        try {
            await deleteNotificationAction(id);
        } catch {
            setNotifications(prev);
            onUnreadUpdate?.(countUnread(prev));
        }
    }, [notifications, onUnreadUpdate]);

    const clearAll = useCallback(async () => {
        const prev = notifications;
        setNotifications([]);
        onUnreadUpdate?.(0);

        try {
            await deleteAllNotificationsAction();
        } catch {
            setNotifications(prev);
            onUnreadUpdate?.(countUnread(prev));
        }
    }, [notifications, onUnreadUpdate]);

    return {
        notifications,
        isLoading,
        hasMore,
        load,
        loadMore,
        remove,
        clearAll,
    };
}
