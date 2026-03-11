"use client";

import { Notification, NotificationStatus } from "@/types/models";
import { cn, formatDateFromNow } from "@/lib/utils";

import ActivityIcon from "@/components/common/activity-icon";
import Link from "next/link";

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead?: (id: string) => void;
}

export function NotificationItem({
    notification,
    onMarkAsRead,
}: Readonly<NotificationItemProps>) {
    const handleClick = () => {
        if (notification.status === NotificationStatus.UNREAD) {
            onMarkAsRead?.(notification.id);
        }
    };

    const content = (
        <button
            className={cn(
                "px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer flex items-start gap-3 group",
                notification.status === NotificationStatus.UNREAD &&
                    "bg-blue-50/50 dark:bg-blue-950/20",
            )}
            onClick={handleClick}
        >
            {/* Icon */}
            <div className="text-xl leading-none pt-0.5 shrink-0">
                <ActivityIcon
                    event={notification.activity.event}
                    className="h-5 w-5 pt-1"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <p className="text-sm font-medium leading-snug">
                            {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                        </p>
                    </div>
                    {notification.status === NotificationStatus.UNREAD && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                    )}
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                        {formatDateFromNow(notification.createdAt)}
                    </p>
                </div>
            </div>
        </button>
    );

    // If notification has an action URL, wrap in Link
    if (notification.actionUrl) {
        return <Link href={notification.actionUrl}>{content}</Link>;
    }

    return content;
}
