"use client";

import { SortDraftsBy, SortOrder } from "@/types/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppFilter from "@/components/common/app-filter";
import { createQueryString } from "@/lib/utils";
import { saveSortPreferences } from "@/lib/actions/filter";
import { useCallback } from "react";

const items = [
  {
    label: "Latest First",
    value: `${SortDraftsBy.UPDATED_AT}-${SortOrder.DESC}`,
  },
  {
    label: "Oldest First",
    value: `${SortDraftsBy.UPDATED_AT}-${SortOrder.ASC}`,
  },
  { label: "Title A-Z", value: `${SortDraftsBy.TITLE}-${SortOrder.ASC}` },
  { label: "Title Z-A", value: `${SortDraftsBy.TITLE}-${SortOrder.DESC}` },
];

export default function SortFilter({
  sortBy = SortDraftsBy.UPDATED_AT,
  order = SortOrder.DESC,
}: Readonly<{
  sortBy?: SortDraftsBy;
  order?: SortOrder;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onSelected = useCallback(
    async (value: string) => {
      const [sort_by, order] = value.split("-");

      await saveSortPreferences("admin_drafts", sort_by, order);

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
