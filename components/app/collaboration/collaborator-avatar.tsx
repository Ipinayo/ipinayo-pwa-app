"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ROLE_LABEL } from "@/lib/constants";
import type { ShareableRole } from "@/types/schemas/collaboration";
import UserAvatar from "@/components/common/user-avatar";
import { cn } from "@/lib/utils";

type Person = {
  name: string | null;
  email: string;
  image: string | null;
  role?: ShareableRole | "OWNER";
};

/**
 * An avatar that reveals the person's name, email, and (optionally) role in a
 * popover. Used wherever a collaborator is shown so names/emails never truncate.
 */
export function CollaboratorAvatar({
  person,
  showRole = false,
  className,
}: Readonly<{
  person: Person;
  showRole?: boolean;
  className?: string;
}>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ring-background shrink-0 rounded-full ring-2 transition-transform hover:z-10 hover:-translate-y-0.5"
        >
          <UserAvatar user={person} className={cn("size-8", className)} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56">
        <p className="truncate text-sm font-medium">
          {person.name || person.email}
        </p>
        <p className="truncate text-xs">{person.email}</p>
        {showRole && person.role && (
          <p className="text-muted-foreground mt-1 text-xs">
            {ROLE_LABEL[person.role] ?? person.role}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
