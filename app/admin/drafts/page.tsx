import { SearchParams, SortDraftsBy, SortOrder } from "@/types/utils";

import DeleteOldDrafts from "@/components/app/admin/drafts/delete-old-drafts";
import DraftSelectionListSkeleton from "@/components/app/admin/drafts/draft-selections-list/index-skeleton";
import DraftSelectionsList from "@/components/app/admin/drafts/draft-selections-list";
import DraftsStats from "@/components/app/admin/drafts/drafts-stats";
import DraftsStatsSkeleton from "@/components/app/admin/drafts/drafts-stats/index-skeleton";
import Search from "@/components/app/admin/drafts/search";
import SortFilter from "@/components/app/admin/drafts/sort-filter";
import { Suspense } from "react";
import { getEnumByValue } from "@/lib/utils";
import { getFilterPreferences } from "@/lib/actions/filter";

export default async function DraftsManagementPage(
  props: Readonly<{
    searchParams: SearchParams;
  }>,
) {
  const filters = await props.searchParams;

  // Get saved preferences from cookies
  const savedPreferences = await getFilterPreferences("admin_drafts");

  const page = Number(filters["page"]) || Number(savedPreferences.page) || 1;
  const query = filters["query"] || savedPreferences.query;
  const sort_by =
    getEnumByValue(SortDraftsBy, filters["sort_by"] || "") ||
    getEnumByValue(SortDraftsBy, savedPreferences.sortBy || "") ||
    SortDraftsBy.UPDATED_AT;
  const order =
    getEnumByValue(SortOrder, filters["order"] || "") ||
    getEnumByValue(SortOrder, savedPreferences.order || "") ||
    SortOrder.DESC;

  const searchKey = [page, query, sort_by, order].join("-");

  return (
    <div className="max-w-full w-full space-y-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-display text-foreground">
            Drafts Management
          </h2>
          <DeleteOldDrafts />
        </div>
        <p className="text-muted-foreground mt-2">View and manage all drafts</p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<DraftsStatsSkeleton />}>
        <DraftsStats />
      </Suspense>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Search query={query} />
        <div className="flex gap-2">
          <SortFilter sortBy={sort_by} order={order} />
        </div>
      </div>

      <Suspense fallback={<DraftSelectionListSkeleton />} key={searchKey}>
        <DraftSelectionsList
          query={query}
          page={page}
          sortBy={sort_by}
          sortOrder={order}
        />
      </Suspense>
    </div>
  );
}
