"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppFilter from "@/components/common/app-filter";
import { createQueryString } from "@/lib/utils";
import { useCallback } from "react";

const items = [
  { label: "Latest First", value: "updatedAt-desc" },
  { label: "Oldest First", value: "updatedAt-asc" },
  { label: "Title A-Z", value: "title-asc" },
  { label: "Title Z-A", value: "title-desc" },
  { label: "Date (Newest)", value: "date-desc" },
  { label: "Date (Oldest)", value: "date-asc" },
];

export default function SortFilter({
  sortBy = "updatedAt",
  order = "desc",
}: {
  sortBy?: string;
  order?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onSelected = useCallback(
    (value: string) => {
      const [sort_by, order] = value.split("-");
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
