"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppFilter from "@/components/common/app-filter";
import { createQueryString } from "@/lib/utils";
import { useCallback } from "react";

const items = [
  { label: "All Types", value: "all" },
  { label: "Feature", value: "feature" },
  { label: "Maintenance", value: "maintenance" },
  { label: "General", value: "general" },
];

export default function TypeFilter({ selected }: { selected?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onSelected = useCallback(
    (value: string) => {
      router.push(
        `${pathname}?${createQueryString(
          { type: value, page: "1" },
          searchParams,
        )}`,
      );
    },
    [pathname, router, searchParams],
  );

  return (
    <AppFilter
      selected={selected ?? "all"}
      onSelected={onSelected}
      items={items}
    />
  );
}
