"use client";

import { SortBy, SortOrder } from "@/types/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppFilter from "@/components/common/app-filter";
import { createQueryString } from "@/lib/utils";
import { saveFilterPreferences } from "@/lib/actions/cookies";
import { useCallback } from "react";

const items = [
  { label: "Date (Newest)", value: `${SortBy.DATE}-${SortOrder.DESC}` },
  { label: "Date (Oldest)", value: `${SortBy.DATE}-${SortOrder.ASC}` },
  { label: "Title A-Z", value: `${SortBy.TITLE}-${SortOrder.ASC}` },
  { label: "Title Z-A", value: `${SortBy.TITLE}-${SortOrder.DESC}` },
  { label: "Latest First", value: `${SortBy.UPDATED_AT}-${SortOrder.DESC}` },
  { label: "Oldest First", value: `${SortBy.UPDATED_AT}-${SortOrder.ASC}` },
];

export default function SortFilter({
  filterType,
  sortBy = SortBy.DATE,
  order = SortOrder.DESC,
}: {
  filterType: "selections" | "dashboard";
  sortBy?: SortBy;
  order?: SortOrder;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onSelected = useCallback(
    async (value: string) => {
      const [sort_by, order] = value.split("-");

      // Save to cookies via server action
      await saveFilterPreferences(filterType, sort_by, order);

      router.push(
        `${pathname}?${createQueryString(
          { sort_by, order, page: "1" },
          searchParams
        )}`
      );
    },
    [pathname, router, searchParams]
  );

  return (
    <AppFilter
      selected={`${sortBy}-${order}`}
      onSelected={onSelected}
      items={items}
    />
  );
}
