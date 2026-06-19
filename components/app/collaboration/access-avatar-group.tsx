"use client";

import type { AccessPersonView } from "./shared";
import { CollaboratorAvatar } from "./collaborator-avatar";
import Link from "next/link";
import { UserPlus2 } from "lucide-react";

const MAX_AVATARS = 4;

export function AccessAvatarGroup({
  people,
  hasAccess,
  manageHref,
}: Readonly<{
  people: AccessPersonView[];
  hasAccess: boolean;
  manageHref: string;
}>) {
  if (people.length === 0) return null;

  const overflow = people.length > MAX_AVATARS;
  const shown = overflow ? people.slice(0, MAX_AVATARS - 1) : people;
  const extra = people.length - shown.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((person) => (
          <CollaboratorAvatar
            key={person.id}
            person={person}
            showRole={hasAccess}
          />
        ))}

        {overflow && (
          <span className="bg-muted text-muted-foreground ring-background flex size-8 items-center justify-center rounded-full text-xs font-medium ring-2">
            +{extra}
          </span>
        )}
      </div>

      {hasAccess && (
        <Link
          href={manageHref}
          aria-label="Manage collaborators"
          className="border-border bg-background text-muted-foreground hover:text-foreground ml-2 flex size-8 items-center justify-center rounded-full border"
        >
          <UserPlus2 className="size-4" />
        </Link>
      )}
    </div>
  );
}
