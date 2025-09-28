"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppPagination from "../app-pagination";

interface UrlPaginationProps {
  currentPage: number;
  totalPages: number;
  className?: string;
}

export function UrlPagination({
  currentPage,
  totalPages,
  className,
}: UrlPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    if (pageNumber === 1) {
      params.delete("page");
    } else {
      params.set("page", pageNumber.toString());
    }
    return `${pathname}?${params.toString()}`;
  };

  const handlePageChange = (pageNumber: number) => {
    router.push(createPageURL(pageNumber));
  };

  return (
    <AppPagination
      currentPage={currentPage}
      handlePageChange={handlePageChange}
      totalPages={totalPages}
      className={className}
    />
  );
}
