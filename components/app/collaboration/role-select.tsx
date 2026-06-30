"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABEL, ROLE_OPTIONS } from "@/lib/constants";

import type { ShareableRole } from "@/types/schemas/collaboration";
import { cn } from "@/lib/utils";

/** The role picker shared by every collaborator/member row. */
export function RoleSelect({
  value,
  onValueChange,
  disabled,
  className,
}: Readonly<{
  value: ShareableRole;
  onValueChange: (role: ShareableRole) => void;
  disabled?: boolean;
  className?: string;
}>) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onValueChange(v as ShareableRole)}
      disabled={disabled}
    >
      <SelectTrigger size="sm" className={cn("h-8 w-28 text-xs", className)}>
        <SelectValue>{ROLE_LABEL[value] ?? value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ROLE_OPTIONS.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            <div className="flex flex-col">
              <span>{r.label}</span>
              <span className="text-muted-foreground text-xs">
                {r.description}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
