"use client";

import { Popover, PopoverTrigger } from "@/components/ui/popover";

import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationModal } from "./notification-modal";
import { usePushPrompt } from "@/contexts/PushPromptContext";
import { useState } from "react";

interface NotificationBellClientProps {
  initialCount: number;
}

export function NotificationBellClient({
  initialCount,
}: NotificationBellClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const { requestPrompt } = usePushPrompt();

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) requestPrompt();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <NotificationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUnreadUpdate={setUnreadCount}
      />
    </Popover>
  );
}
