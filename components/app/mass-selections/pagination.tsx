"use client";

import { UrlPagination } from "@/components/common/url-pagination";
import { saveQueryFilterPreferences } from "@/lib/actions/filter";
import { useEffect } from "react";

interface PaginationProps {
  filterType?: "selections" | "dashboard";
  currentPage: number;
  totalPages: number;
  className?: string;
}

export default function Pagination({
  filterType,
  currentPage,
  totalPages,
  className,
}: Readonly<PaginationProps>) {
  useEffect(() => {
    // Save current page to cookies on mount
    const saveSearchPagination = async () => {
      if (filterType)
        await saveQueryFilterPreferences(
          filterType,
          "page",
          currentPage.toString()
        );
    };
    saveSearchPagination();
  }, []);

  return (
    <UrlPagination
      currentPage={currentPage}
      totalPages={totalPages}
      className={className}
      onPageChange={async (number) => {
        if (filterType)
          await saveQueryFilterPreferences(
            filterType,
            "page",
            number.toString()
          );
      }}
    />
  );
}
