"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppFilter from "../app-filter";
import { createQueryString } from "@/lib/utils";
import { saveQueryFilterPreferences } from "@/lib/actions/filter";
import { useCallback } from "react";

export default function QueryFilter({
  filterType,
  queryName,
  items,
  selected,
}: {
  filterType: "selections" | "dashboard";
  queryName: "season" | "year";
  items: { label: string; value: string }[] | string[];
  selected?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onSelected = useCallback(
    async (value: string) => {
      await saveQueryFilterPreferences(filterType, queryName, value);

      router.push(
        `${pathname}?${createQueryString(
          { [queryName]: value, page: "1" },
          searchParams
        )}`
      );
    },
    [pathname, router, searchParams, filterType, queryName]
  );

  return (
    <AppFilter selected={selected} onSelected={onSelected} items={items} />
  );
}
