"use client";

import SearchBar from "@/components/common/search-bar";
import { saveQueryFilterPreferences } from "@/lib/actions/filter";
import { useEffect } from "react";

export default function Search({
  query,
  placeholder,
}: {
  query?: string;
  placeholder?: string;
}) {
  useEffect(() => {
    // Save current search query to cookies on mount
    const saveSearchQuery = async () => {
      if (query) await saveQueryFilterPreferences("selections", "query", query);
    };
    saveSearchQuery();
  }, []);

  return (
    <SearchBar
      query={query}
      placeholder={placeholder}
      onSearch={async (term) =>
        await saveQueryFilterPreferences("selections", "query", term)
      }
    />
  );
}
