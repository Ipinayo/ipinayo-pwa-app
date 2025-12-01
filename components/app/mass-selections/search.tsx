"use client";

import SearchBar from "@/components/common/search-bar";
import { saveQueryFilterPreferences } from "@/lib/actions/filter";
import { useEffect } from "react";

export default function Search({
  filterType,
  query,
  placeholder,
}: {
  filterType: "selections" | "dashboard";
  query?: string;
  placeholder?: string;
}) {
  useEffect(() => {
    // Save current search query to cookies on mount
    const saveSearchQuery = async () => {
      if (query) await saveQueryFilterPreferences(filterType, "query", query);
    };
    saveSearchQuery();
  }, []);

  return (
    <SearchBar
      query={query}
      placeholder={placeholder}
      onSearch={async (term) =>
        await saveQueryFilterPreferences(filterType, "query", term)
      }
    />
  );
}
