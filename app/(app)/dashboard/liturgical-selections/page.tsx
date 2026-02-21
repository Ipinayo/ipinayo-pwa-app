import { LiturgicalSeason, LiturgicalYear } from "@/lib/generated/prisma/index";
import { SearchParams, SortBy, SortOrder } from "@/types/utils";
import { getEnumByValue, stringToBoolean } from "@/lib/utils";
import {
  liturgicalSeasonItems,
  liturgicalYearItems,
  seasonsFilter,
  typesFilter,
  yearsFilter,
} from "@/lib/constants";

import BackButton from "@/components/common/back-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import MassSelectionList from "@/components/app/mass-selections/mass-selection-list";
import MassSelectionListSkeleton from "@/components/app/mass-selections/mass-selection-list/index-skeleton";
import { Plus } from "lucide-react";
import QueryFilter from "@/components/common/query-filter";
import Search from "@/components/app/mass-selections/search";
import SortFilter from "@/components/app/mass-selections/sort-filter";
import { Suspense } from "react";
import { getFilterPreferences } from "@/lib/actions/filter";
import { requireAuth } from "@/lib/auth";

const seasons = [
  { label: "All Seasons", value: "all" },
  ...liturgicalSeasonItems,
];
const years = [{ label: "All Years", value: "all" }, ...liturgicalYearItems];

export default async function MassSelectionsPage(props: {
  searchParams: SearchParams;
}) {
  const queryString = new URLSearchParams(props.searchParams as any).toString();
  const callbackUrl = queryString
    ? `/dashboard/liturgical-selections?${queryString}`
    : `/dashboard/liturgical-selections`;
  await requireAuth(callbackUrl);

  const filters = await props.searchParams;

  // Get saved preferences from cookies
  const savedPreferences = await getFilterPreferences("dashboard");

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
    <div className="max-w-full w-full">
      <BackButton to="/dashboard" backText="Back to dashboard" />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display text-foreground">
            My Liturgical Selections
          </h2>
        </div>
        <Link href="/liturgical-selections/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Selection
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Search
          filterType="dashboard"
          query={query}
          placeholder="Search my selections..."
        />
        <div className="flex gap-2">
          <QueryFilter
            filterType="dashboard"
            selected={isPublic ?? "all"}
            queryName={"public"}
            items={typesFilter}
          />
          <QueryFilter
            filterType="dashboard"
            selected={season ?? "all"}
            queryName={"season"}
            items={seasonsFilter}
          />
          <QueryFilter
            filterType="dashboard"
            selected={year ?? "all"}
            queryName={"year"}
            items={yearsFilter}
          />
          <SortFilter filterType="dashboard" sortBy={sort_by} order={order} />
        </div>
      </div>

      <Suspense fallback={<MassSelectionListSkeleton />} key={searchKey}>
        <MassSelectionList
          filterType="dashboard"
          query={query}
          year={year}
          season={season}
          page={page}
          sortBy={sort_by}
          sortOrder={order}
          userOnly={true}
          isPublic={stringToBoolean(isPublic)}
        />
      </Suspense>
    </div>
  );
}
