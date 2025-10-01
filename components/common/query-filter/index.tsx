"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppFilter from "../app-filter";
import { createQueryString } from "@/lib/utils";
import { useCallback } from "react";

export default function QueryFilter({
  items,
  selected,
  queryName,
}: {
  selected?: string;
  queryName: string;
  items: { label: string; value: string }[] | string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onSelected = useCallback(
    (value: string) =>
      router.push(
        `${pathname}?${createQueryString(
          { [queryName]: value, page: "1" },
          searchParams
        )}`
      ),
    [pathname, router, searchParams]
  );

  return (
    <AppFilter selected={selected} onSelected={onSelected} items={items} />
  );
}
