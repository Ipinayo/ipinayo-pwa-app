"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

/**
 * Refreshes the current route's server data (`router.refresh()`) so the page —
 * including any selection/draft the assistant just edited — reflects the latest
 * state. Spins while the refresh is in flight.
 */
export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9"
      aria-label="Refresh page"
      title="Refresh"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw className={cn("size-4", isPending && "animate-spin")} />
    </Button>
  );
}
