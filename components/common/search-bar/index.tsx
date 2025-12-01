"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { createQueryString } from "@/lib/utils";
import debounce from "lodash.debounce";
import { useCallback } from "react";

export default function SearchBar({
  placeholder = "Search...",
  query,
  onSearch,
}: {
  placeholder?: string;
  query?: string;
  onSearch?: ((term: string) => void) | ((term: string) => Promise<void>);
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      await onSearch?.(term);
      router.push(
        `${pathname}?${createQueryString(
          { query: term, page: "1" },
          searchParams
        )}`
      );
    }, 300),
    []
  );

  return (
    <div className="relative flex-1">
      <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
      <Input
        placeholder={placeholder}
        type="text"
        defaultValue={query ?? ""}
        onChange={(e) => debouncedSearch(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
