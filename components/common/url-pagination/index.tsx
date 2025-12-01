"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppPagination from "../app-pagination";
import { createQueryString } from "@/lib/utils";
import { useCallback } from "react";

interface UrlPaginationProps {
  currentPage: number;
  totalPages: number;
  className?: string;
  onPageChange?:
    | ((pageNumber: number) => void)
    | ((pageNumber: number) => Promise<void>);
}

export function UrlPagination({
  currentPage,
  totalPages,
  className,
  onPageChange,
}: UrlPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = useCallback(
    async (pageNumber: number) => {
      await onPageChange?.(pageNumber);

      router.push(
        `${pathname}?${createQueryString(
          { page: pageNumber.toString() },
          searchParams
        )}`
      );
    },
    [pathname, router, searchParams]
  );

  return (
    <AppPagination
      currentPage={currentPage}
      handlePageChange={handlePageChange}
      totalPages={totalPages}
      className={className}
    />
  );
}
