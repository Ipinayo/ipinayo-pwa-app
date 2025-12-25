"use client";

import { UrlPagination } from "@/components/common/url-pagination";
import { saveQueryFilterPreferences } from "@/lib/actions/filter";
import { useEffect } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  className,
}: PaginationProps) {
  useEffect(() => {
    // Save current page to cookies on mount
    const saveSearchPagination = async () => {
      await saveQueryFilterPreferences(
        "admin_users",
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
      onPageChange={async (number) =>
        await saveQueryFilterPreferences(
          "admin_users",
          "page",
          number.toString()
        )
      }
    />
  );
}
