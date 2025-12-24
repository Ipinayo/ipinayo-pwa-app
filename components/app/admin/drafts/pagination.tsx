"use client";

import { UrlPagination } from "@/components/common/url-pagination";
import { saveQueryFilterPreferences } from "@/lib/actions/filter";
import { useEffect } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  saveFilter: boolean;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  saveFilter,
  className,
}: Readonly<PaginationProps>) {
  useEffect(() => {
    // Save current page to cookies on mount
    const saveSearchPagination = async () => {
      await saveQueryFilterPreferences(
        "admin_drafts",
        "page",
        currentPage.toString()
      );
    };
    if (saveFilter) {
      saveSearchPagination();
    }
  }, []);

  return (
    <UrlPagination
      currentPage={currentPage}
      totalPages={totalPages}
      className={className}
      onPageChange={async (number) => {
        if (saveFilter)
          await saveQueryFilterPreferences(
            "admin_drafts",
            "page",
            number.toString()
          );
      }}
    />
  );
}
