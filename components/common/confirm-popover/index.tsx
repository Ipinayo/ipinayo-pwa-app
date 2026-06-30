"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A destructive-confirm popover: trigger → "Are you sure?" → Cancel / Confirm. */
export function ConfirmPopover({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  pending,
  align = "end",
  className,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  pending?: boolean;
  align?: "start" | "center" | "end";
  className?: string;
}>) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align={align} className={cn("w-60", className)}>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        <div className="mt-3 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : confirmLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
