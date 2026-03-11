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
        "px-4 py-3 hover:bg-muted/50 transition-colors flex items-start gap-3 group w-full",
        notification.status === NotificationStatus.UNREAD && "bg-primary/5",
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
          <div className="flex-1 justify-start min-w-0">
            <p className="text-sm font-medium leading-snug truncate text-left">
              {notification.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 text-left">
              {notification.message}
            </p>
          </div>
          {notification.status === NotificationStatus.UNREAD && (
            <div className="h-2 w-2 rounded-full primary-gradient shrink-0 mt-1" />
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
