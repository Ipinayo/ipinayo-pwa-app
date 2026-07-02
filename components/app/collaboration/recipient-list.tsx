"use client";

import { CircleX, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CollaboratorAvatar } from "./collaborator-avatar";
import { RoleSelect } from "./role-select";
import type { ShareableRole } from "@/types/schemas/collaboration";

export type RecipientDraft = {
  userId?: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: ShareableRole;
};

/** Renders the queued recipients with a role picker and a remove control. */
export function RecipientList({
  recipients,
  onRole,
  onRemove,
}: Readonly<{
  recipients: RecipientDraft[];
  onRole: (index: number, role: ShareableRole) => void;
  onRemove: (index: number) => void;
}>) {
  return (
    <>
      {recipients.map((r, index) => (
        <div
          key={r.userId ?? r.email}
          className="flex items-center gap-2 py-1.5"
        >
          {r.userId ? (
            <CollaboratorAvatar
              person={{
                name: r.name ?? null,
                email: r.email,
                image: r.image ?? null,
              }}
            />
          ) : (
            <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
              <Mail className="size-4" />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{r.name || r.email}</p>
            <p className="text-muted-foreground truncate text-xs">
              {r.userId ? r.email : "Invitation will be sent"}
            </p>
          </div>

          <RoleSelect
            value={r.role}
            onValueChange={(role) => onRole(index, role)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onRemove(index)}
            aria-label="Remove from list"
          >
            <CircleX />
          </Button>
        </div>
      ))}
    </>
  );
}
