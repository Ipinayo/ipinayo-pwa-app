"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function BackButton({
  fallback = "/",
  backText = "Back",
  className,
}: {
  fallback?: string;
  backText?: string;
  className?: string;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={cn("gap-2", className)}
    >
      <ArrowLeft className="h-4 w-4" />
      {backText}
    </Button>
  );
}

export default BackButton;
