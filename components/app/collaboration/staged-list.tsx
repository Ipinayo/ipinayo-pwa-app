"use client";

import { Button } from "@/components/ui/button";
import { CircleX } from "lucide-react";
import { CollaboratorAvatar } from "./collaborator-avatar";
import { RoleSelect } from "./role-select";
import type { ShareableRole } from "@/types/schemas/collaboration";
import type { UserLite } from "@/types/models";

export type StagedRecipient = { user: UserLite; role: ShareableRole };

/**
 * The list of people queued to be added, each with a role picker and a remove
 * control. Layout/footer (submit button, message box) stays with the parent.
 */
export function StagedList({
  staged,
  onRole,
  onRemove,
}: Readonly<{
  staged: StagedRecipient[];
  onRole: (userId: string, role: ShareableRole) => void;
  onRemove: (userId: string) => void;
}>) {
  return (
    <>
      {staged.map((s) => (
        <div key={s.user.id} className="flex items-center gap-2 py-1.5">
          <CollaboratorAvatar person={s.user} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {s.user.name || s.user.email}
            </p>
            {s.user.name && (
              <p className="text-muted-foreground truncate text-xs">
                {s.user.email}
              </p>
            )}
          </div>
          <RoleSelect
            value={s.role}
            onValueChange={(role) => onRole(s.user.id, role)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onRemove(s.user.id)}
            aria-label="Remove from list"
          >
            <CircleX />
          </Button>
        </div>
      ))}
    </>
  );
}
