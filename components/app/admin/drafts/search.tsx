"use client";

import SearchBar from "@/components/common/search-bar";
import { saveQueryFilterPreferences } from "@/lib/actions/filter";
import { useEffect } from "react";

export default function Search({ query }: Readonly<{ query?: string }>) {
  useEffect(() => {
    // Save current search query to cookies on mount
    const saveSearchQuery = async () => {
      if (query)
        await saveQueryFilterPreferences("admin_drafts", "query", query);
    };
    saveSearchQuery();
  }, []);

  return (
    <SearchBar
      query={query}
      placeholder="Search by title or owner..."
      onSearch={async (term) =>
        await saveQueryFilterPreferences("admin_drafts", "query", term)
      }
    />
  );
}
