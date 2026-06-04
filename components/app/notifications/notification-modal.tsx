"use client";

import { Bell, ChevronRight, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCallback, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NotificationItem } from "./notification-item";
import { NotificationStatus } from "@/types/models";
import { useNotifications } from "@/hooks/use-notifications";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadUpdate?: (count: number) => void;
}

export function NotificationModal({
  isOpen,
  onClose,
  onUnreadUpdate,
}: NotificationModalProps) {
  const {
    notifications,
    isLoading,
    hasMore,
    load,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ onUnreadUpdate });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load fresh data each time the modal opens
  useEffect(() => {
    if (isOpen) {
      load();
    }
  }, [isOpen, load]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    if (
      scrollHeight - scrollTop - clientHeight < 200 &&
      hasMore &&
      !isLoading
    ) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <PopoverTrigger asChild>
        <div />
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 rounded-lg"
        align="end"
        sideOffset={8}
      >
        <div className="flex flex-col max-h-[calc(100vh-120px)]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b text-sm">
            <span className="text-muted-foreground">
              {
                notifications.filter(
                  (n) => n.status === NotificationStatus.UNREAD,
                ).length
              }{" "}
              new
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-6 px-2 text-xs"
            >
              Mark all as read
            </Button>
          </div>

          {/* Notifications List */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto min-h-[300px] px-2"
          >
            {notifications.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* End of list message */}
                {!hasMore && notifications.length > 0 && (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    No more notifications
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-3">
            <Link href="/dashboard/activities">
              <Button
                variant="ghost"
                className="w-full justify-between h-auto py-2 px-2"
                onClick={onClose}
              >
                <span className="text-sm">View all activities</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
