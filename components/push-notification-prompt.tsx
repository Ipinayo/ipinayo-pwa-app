"use client";

import { Bell, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  PUSH_PROMPT_REQUEST_EVENT,
  dismissPushPrompt,
  shouldShowPushPrompt,
} from "@/lib/push-notification-utils";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePushSubscription } from "@/hooks/use-push-subscription";

export function PushNotificationPrompt() {
  const { state, subscribe } = usePushSubscription();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Wait until subscription state is known
    if (state === "loading" || state === "unsupported" || state === "denied") {
      return;
    }

    const timer = setTimeout(() => {
      if (shouldShowPushPrompt(state === "subscribed")) {
        setShowPrompt(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [state]);

  // Allow an explicit trigger (e.g. clicking the notification bell) to show the
  // prompt on demand, without the 5s delay. Still honours the dismiss cooldown
  // and skips when unsupported/denied/already subscribed.
  useEffect(() => {
    const handler = () => {
      if (
        state === "loading" ||
        state === "unsupported" ||
        state === "denied"
      ) {
        return;
      }
      if (shouldShowPushPrompt(state === "subscribed")) {
        setShowPrompt(true);
      }
    };

    globalThis.addEventListener(PUSH_PROMPT_REQUEST_EVENT, handler);
    return () =>
      globalThis.removeEventListener(PUSH_PROMPT_REQUEST_EVENT, handler);
  }, [state]);

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const result = await subscribe();

      if (result === "subscribed") {
        toast.success("Notifications enabled!", {
          description:
            "You will now receive notifications about important activities.",
        });
        setShowPrompt(false);
      } else if (result === "denied") {
        toast.error("Notifications blocked", {
          description:
            "You have blocked notifications. Enable them in your browser settings.",
        });
        setShowPrompt(false);
      } else {
        toast.error("Failed to enable notifications", {
          description: "Please try again later.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    dismissPushPrompt();
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <Card className="fixed top-6 left-0 md:left-6 w-full max-w-sm shadow-lg border-primary/20 animate-in slide-in-from-bottom-4 duration-300 z-50">
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="font-semibold text-sm">Stay updated</p>
              <p className="text-xs text-muted-foreground mt-1">
                Enable notifications to get instant updates on important
                activities.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleEnable}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Enabling..." : "Enable Notifications"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                disabled={isLoading}
                className="flex-1"
              >
                Not Now
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
            aria-label="Dismiss notification prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
