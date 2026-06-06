import { Check, Loader2, X } from "lucide-react";

import { ToolStatus } from "@/types/assistant";
import { cn } from "@/lib/utils";

export function ToolStatusChip({ tool }: Readonly<{ tool: ToolStatus }>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground",
        tool.state === "error" && "border-destructive/40 text-destructive",
      )}
    >
      {tool.state === "running" && (
        <Loader2 className="size-3 animate-spin" aria-hidden />
      )}
      {tool.state === "done" && (
        <Check className="size-3 text-primary" aria-hidden />
      )}
      {tool.state === "error" && <X className="size-3" aria-hidden />}
      {tool.label}
    </span>
  );
}
