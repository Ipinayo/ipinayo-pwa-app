"use client";

import { BookOpen, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import DownloadButton from "@/components/app/mass-selections/download-button";
import { EntityRef } from "@/types/assistant";
import Link from "next/link";
import { cn } from "../../../lib/utils";
import { useAssistant } from "./assistant-provider";
import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * A reference card for a draft/selection the agent touched. The user decides
 * whether to open it — the assistant never forces navigation.
 */
export function EntityCard({ entity }: Readonly<{ entity: EntityRef }>) {
  const { close } = useAssistant();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isSelection = entity.type === "selection";
  const href = isSelection
    ? `/liturgical-selections/${entity.id}`
    : `/liturgical-selections/new/${entity.id}`;

  // On small screens the assistant is a full-screen sheet over the page, so
  // close it on open to reveal the entity. On desktop it's a side dock — leave it.
  const handleOpen = () => {
    if (isDesktop === false) close();
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <span className="flex size-9 p-2 rounded-full bg-muted shrink-0 items-center justify-center">
        <BookOpen
          className={cn(
            "size-4 ",
            isSelection ? "text-muted-foreground" : "text-amber-500",
          )}
          aria-hidden
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{entity.title}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {entity.type}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {isSelection && (
          <DownloadButton
            selectionId={entity.id}
            variant="ghost"
            size="sm"
            className="gap-1.5"
          />
        )}
        <Button variant="outline" size="sm" asChild>
          <Link href={href} onClick={handleOpen}>
            Open
            <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
