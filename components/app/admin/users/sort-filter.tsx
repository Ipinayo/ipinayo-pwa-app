"use client";

import { SortOrder, SortUsersBy } from "@/types/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppFilter from "@/components/common/app-filter";
import { createQueryString } from "@/lib/utils";
import { saveSortPreferences } from "@/lib/actions/filter";
import { useCallback } from "react";

const items = [
  {
    label: "Newest First",
    value: `${SortUsersBy.CREATED_AT}-${SortOrder.DESC}`,
  },
  {
    label: "Oldest First",
    value: `${SortUsersBy.CREATED_AT}-${SortOrder.ASC}`,
  },
  { label: "Name A-Z", value: `${SortUsersBy.NAME}-${SortOrder.ASC}` },
  { label: "Name Z-A", value: `${SortUsersBy.NAME}-${SortOrder.DESC}` },
  { label: "Email A-Z", value: `${SortUsersBy.EMAIL}-${SortOrder.ASC}` },
  { label: "Email Z-A", value: `${SortUsersBy.EMAIL}-${SortOrder.DESC}` },
];

export default function SortFilter({
  sortBy = SortUsersBy.CREATED_AT,
  order = SortOrder.DESC,
}: {
  sortBy?: SortUsersBy;
  order?: SortOrder;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onSelected = useCallback(
    async (value: string) => {
      const [sort_by, order] = value.split("-");

      // Save to cookies via server action
      await saveSortPreferences("admin_users", sort_by, order);

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
