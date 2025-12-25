"use client";

import SearchBar from "@/components/common/search-bar";
import { saveQueryFilterPreferences } from "@/lib/actions/filter";
import { useEffect } from "react";

export default function Search({
  filterType,
  query,
  placeholder,
}: Readonly<{
  filterType?: "selections" | "dashboard" | "admin_selections";
  query?: string;
  placeholder?: string;
}>) {
  // Save search query to cookies once on mount
  useEffect(() => {
    // Save current search query to cookies on mount
    const saveSearchQuery = async () => {
      if (query && filterType)
        await saveQueryFilterPreferences(filterType, "query", query);
    };
    saveSearchQuery();
  }, []);

  return (
    <SearchBar
      query={query}
      placeholder={placeholder}
      onSearch={async (term) => {
        if (filterType)
          await saveQueryFilterPreferences(filterType, "query", term);
      }}
    />
  );
}
