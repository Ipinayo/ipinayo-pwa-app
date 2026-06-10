"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAssistant } from "./assistant-provider";

export function AssistantTrigger({
  label = "Create with Ìpínayò AI",
  className,
  collapse = false,
}: Readonly<{
  label?: string;
  className?: string;
  /** Icon-only below `lg`, full label from `lg` up — for tight spots like the nav. */
  collapse?: boolean;
}>) {
  const { open } = useAssistant();

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Create a selection with Ìpínayò AI"
      className={cn(
        "group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-md text-sm font-medium text-white shadow-md transition-all duration-700",
        collapse ? "px-2.5 lg:px-5" : "px-5",
        "animate-assistant-gradient bg-linear-to-r bg-size-[200%_100%] from-primary via-primary-light to-fuchsia-600",
        " hover:shadow-lg hover:shadow-primary/40",
        "focus-visible:ring-primary/50 outline-none focus-visible:ring-[3px]",
        className,
      )}
    >
      {" "}
      <Sparkles
        className="size-4 animate-pulse text-white/80"
        aria-hidden
      />{" "}
      <span
        className={cn(
          "relative whitespace-nowrap",
          collapse &&
            "hidden assistant-open:lg:hidden assistant-open:xl:inline lg:inline",
        )}
      >
        {" "}
        {label}
      </span>{" "}
    </button>
  );
}
