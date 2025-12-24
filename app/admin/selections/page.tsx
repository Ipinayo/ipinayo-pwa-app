import { LiturgicalSeason, LiturgicalYear } from "@/types/models";
import { SearchParams, SortBy, SortOrder } from "@/types/utils";
import { getEnumByValue, stringToBoolean } from "@/lib/utils";
import { seasonsFilter, typesFilter, yearsFilter } from "@/lib/constants";

import MassSelectionList from "@/components/app/mass-selections/mass-selection-list";
import MassSelectionListSkeleton from "@/components/app/mass-selections/mass-selection-list/index-skeleton";
import QueryFilter from "@/components/common/query-filter";
import Search from "@/components/app/mass-selections/search";
import SelectionsStats from "@/components/app/admin/selections/selections-stats";
import SelectionsStatsSkeleton from "@/components/app/admin/selections/selections-stats/index-skeleton";
import SortFilter from "@/components/app/mass-selections/sort-filter";
import { Suspense } from "react";
import { getFilterPreferences } from "@/lib/actions/filter";

export default async function SelectionsManagement(
  props: Readonly<{
    searchParams: SearchParams;
  }>
) {
  const filters = await props.searchParams;

  // Get saved preferences from cookies
  const savedPreferences = await getFilterPreferences("admin_selections");

  const page = Number(filters["page"]) || Number(savedPreferences.page) || 1;
  const query = filters["query"] || savedPreferences.query;
  const season =
    getEnumByValue(LiturgicalSeason, filters["season"] || "") ||
    getEnumByValue(LiturgicalSeason, savedPreferences.season || "");
  const year =
    getEnumByValue(LiturgicalYear, filters["year"] || "") ||
    getEnumByValue(LiturgicalYear, savedPreferences.year || "");
  const sort_by =
    getEnumByValue(SortBy, filters["sort_by"] || "") ||
    getEnumByValue(SortBy, savedPreferences.sortBy || "") ||
    SortBy.UPDATED_AT;
  const order =
    getEnumByValue(SortOrder, filters["order"] || "") ||
    getEnumByValue(SortOrder, savedPreferences.order || "") ||
    SortOrder.DESC;
  const isPublic = filters["public"] || savedPreferences.public;

  const searchKey = [page, query, season, year].join("-");

  return (
    <div className="max-w-full w-full space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-display text-foreground">
          Liturgical Selections Management
        </h2>
        <p className="text-muted-foreground mt-2">
          View and manage all Liturgical Selections
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<SelectionsStatsSkeleton />}>
        <SelectionsStats />
      </Suspense>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Search
          filterType="admin_selections"
          query={query}
          placeholder="Search selections..."
        />
        <div className="flex gap-2">
          <QueryFilter
            filterType="admin_selections"
            selected={isPublic ?? "all"}
            queryName={"public"}
            items={typesFilter}
          />
          <QueryFilter
            filterType="admin_selections"
            selected={season ?? "all"}
            queryName={"season"}
            items={seasonsFilter}
          />
          <QueryFilter
            filterType="admin_selections"
            selected={year ?? "all"}
            queryName={"year"}
            items={yearsFilter}
          />
          <SortFilter
            filterType="admin_selections"
            sortBy={sort_by}
            order={order}
          />
        </div>
      </div>

      <Suspense fallback={<MassSelectionListSkeleton />} key={searchKey}>
        <MassSelectionList
          filterType="admin_selections"
          query={query}
          year={year}
          season={season}
          page={page}
          sortBy={sort_by}
          sortOrder={order}
          isPublic={stringToBoolean(isPublic)}
        />
      </Suspense>
    </div>
  );
}
