"use client";

import { createQueryString, getActivityEvent } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppFilter from "@/components/common/app-filter";
import { useCallback } from "react";

const ENTITY_TYPES = [
  { label: "All types", value: "all" },
  { label: "Selections", value: "selection" },
  { label: "Drafts", value: "draft" },
  { label: "Users", value: "user" },
  { label: "System", value: "system" },
];

const EVENT_KEYS = [
  "selection.created_by_self",
  "selection.cloned_by_self",
  "selection.cloned_by_other",
  "selection.updated_by_self",
  "selection.deleted_by_self",
  "draft.created_by_self",
  "draft.updated_by_self",
  "draft.expiring",
  "draft.expired",
  "draft.deleted_by_self",
  "draft.deleted_by_other",
  "user.registered",
  "user.updated",
  "system.announcement",
];

const EVENTS = [
  { label: "All events", value: "all" },
  ...EVENT_KEYS.map((event) => ({
    label: getActivityEvent(event, true),
    value: event,
  })),
];

export default function ActivityFilters({
  entityType,
  event,
}: {
  entityType?: string;
  event?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = useCallback(
    (key: string, value: string) => {
      router.push(
        `${pathname}?${createQueryString({ [key]: value, page: "1" }, searchParams)}`,
      );
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="w-full sm:w-48">
        <AppFilter
          selected={entityType ?? "all"}
          items={ENTITY_TYPES}
          onSelected={(value) => onChange("type", value)}
        />
      </div>
      <div className="w-full sm:w-60">
        <AppFilter
          selected={event ?? "all"}
          items={EVENTS}
          onSelected={(value) => onChange("event", value)}
        />
      </div>
    </div>
  );
}
