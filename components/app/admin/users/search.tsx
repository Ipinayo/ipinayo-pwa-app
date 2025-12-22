"use client";

import SearchBar from "@/components/common/search-bar";
import { saveQueryFilterPreferences } from "@/lib/actions/filter";
import { useEffect } from "react";

export default function Search({ query }: { query?: string }) {
  useEffect(() => {
    // Save current search query to cookies on mount
    const saveSearchQuery = async () => {
      if (query)
        await saveQueryFilterPreferences("admin_users", "query", query);
    };
    saveSearchQuery();
  }, []);

  return (
    <SearchBar
      query={query}
      placeholder="Search by name or email..."
      onSearch={async (term) =>
        await saveQueryFilterPreferences("admin_users", "query", term)
      }
    />
  );
}
