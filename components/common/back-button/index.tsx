"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppNavigation } from "@/contexts/AppNavigationContext";

function BackButton({
  to,
  fallback = "/",
  backText = "Back",
  className,
}: {
  to?: string;
  fallback?: string;
  backText?: string;
  className?: string;
}) {
  const { canGoBack, handleBack, navigateTo } = useAppNavigation();

  const onBack = () => {
    if (to) {
      navigateTo(to);
    } else if (canGoBack) {
      handleBack();
    } else {
      navigateTo(fallback);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onBack}
      className={cn("gap-2", className)}
    >
      <ArrowLeft className="h-4 w-4" />
      {backText}
    </Button>
  );
}

export default BackButton;
