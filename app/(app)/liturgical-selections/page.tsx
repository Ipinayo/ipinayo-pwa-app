import {
  LiturgicalSeason,
  LiturgicalYear,
} from "../../../lib/generated/prisma/index";
import { SearchParams, SortBy, SortOrder } from "@/types/utils";
import { liturgicalSeasonItems, liturgicalYearItems } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import MassSelectionList from "@/components/app/mass-selections/mass-selection-list";
import MassSelectionListSkeleton from "@/components/app/mass-selections/mass-selection-list/index-skeleton";
import { Plus } from "lucide-react";
import QueryFilter from "@/components/common/query-filter";
import SearchBar from "@/components/common/search-bar";
import SortFilter from "@/components/app/mass-selections/sort-filter";
import { Suspense } from "react";
import { getEnumByValue } from "@/lib/utils";
import { getFilterPreferences } from "@/lib/actions/filter";

const seasons = [
  { label: "All Seasons", value: "all" },
  ...liturgicalSeasonItems,
];
const years = [{ label: "All Years", value: "all" }, ...liturgicalYearItems];

export default async function MassSelectionsPage(props: {
  searchParams: SearchParams;
}) {
  const filters = await props.searchParams;

  // Get saved preferences from cookies
  const savedPreferences = await getFilterPreferences("selections");

  const page = Number(filters["page"]) || 1;
  const query = filters["query"] || "";
  const season = getEnumByValue(LiturgicalSeason, filters["season"] || "");
  const year = getEnumByValue(LiturgicalYear, filters["year"] || "");
  const sort_by =
    getEnumByValue(SortBy, filters["sort_by"] || "") ||
    getEnumByValue(SortBy, savedPreferences.sortBy || "") ||
    SortBy.DATE;
  const order =
    getEnumByValue(SortOrder, filters["order"] || "") ||
    getEnumByValue(SortOrder, savedPreferences.order || "") ||
    SortOrder.DESC;

  const searchKey = [page, query, season, year].join("-");

  return (
    <div className="max-w-full w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display text-foreground">
            Liturgical Selections
          </h2>
          <p className="text-muted-foreground mt-2">
            Plan and organize liturgical music with ease
          </p>
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
        <SearchBar placeholder="Search selections..." />
        <div className="flex gap-2">
          <QueryFilter
            selected={season ?? "all"}
            queryName={"season"}
            items={seasons}
          />
          <QueryFilter
            selected={year ?? "all"}
            queryName={"year"}
            items={years}
          />
          <SortFilter filterType="selections" sortBy={sort_by} order={order} />
        </div>
      </div>

      <Suspense fallback={<MassSelectionListSkeleton />} key={searchKey}>
        <MassSelectionList
          query={query}
          year={year}
          season={season}
          page={page}
          sortBy={sort_by}
          sortOrder={order}
        />
      </Suspense>
    </div>
  );
}
