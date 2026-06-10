"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * A user's chat bubble. Long messages are clamped to three lines with a
 * "Show more"/"Show less" toggle.
 */
export function UserMessage({ text }: Readonly<{ text: string }>) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clampable, setClampable] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    // Only meaningful while collapsed (clamp applied); don't unset once expanded.
    if (el && !expanded) setClampable(el.scrollHeight > el.clientHeight + 1);
  }, [text, expanded]);

  return (
    <div className="flex max-w-[85%] flex-col items-end gap-1">
      <div
        ref={ref}
        className={cn(
          "bg-primary/10 text-foreground dark:bg-primary/20 rounded-2xl rounded-br-sm px-4 py-2.5 text-sm wrap-break-word whitespace-pre-wrap",
          !expanded && "line-clamp-3",
        )}
      >
        {text}
      </div>
      {clampable && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
