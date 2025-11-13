"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSAL_KEY = "pwa-install-dismissed";
const DISMISSAL_DAYS = 2;

// Helper function to check if dismissal period is still active
function isDismissalActive(): boolean {
  if (typeof window === "undefined") return false;

  const dismissed = localStorage.getItem(DISMISSAL_KEY);
  if (!dismissed) return false;

  const dismissedTime = Number.parseInt(dismissed);
  const daysSinceDismissal =
    (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

  return daysSinceDismissal < DISMISSAL_DAYS;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      // Check if user dismissed recently before showing
      if (isDismissalActive()) {
        console.log("PWA install prompt dismissed recently, not showing");
        return;
      }

      // Save the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install prompt
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log("PWA was installed");
      setShowPrompt(false);
      setDeferredPrompt(null);
      // Clear dismissal when app is installed
      localStorage.removeItem(DISMISSAL_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
      // Clear dismissal on acceptance
      localStorage.removeItem(DISMISSAL_KEY);
    } else {
      console.log("User dismissed the install prompt");
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
    // Store dismissal in localStorage to avoid showing again for a while
    localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
    console.log(
      `PWA install prompt dismissed, will not show for ${DISMISSAL_DAYS} days`
    );
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Install Ìpínayò</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Install Ìpínayò on your device for a more seamless experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>
            <Button type="button" variant="outline" onClick={handleDismiss}>
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
