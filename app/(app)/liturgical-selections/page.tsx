import {
  LiturgicalSeason,
  LiturgicalYear,
} from "../../../lib/generated/prisma/index";
import { SearchParams, SortBy, SortOrder } from "@/types/utils";
import { seasonsFilter, yearsFilter } from "@/lib/constants";

import { AssistantTrigger } from "@/components/app/assistant/assistant-trigger";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import MassSelectionList from "@/components/app/mass-selections/mass-selection-list";
import MassSelectionListSkeleton from "@/components/app/mass-selections/mass-selection-list/index-skeleton";
import { Plus } from "lucide-react";
import QueryFilter from "@/components/common/query-filter";
import Search from "@/components/app/mass-selections/search";
import SortFilter from "@/components/app/mass-selections/sort-filter";
import { Suspense } from "react";
import { getEnumByValue } from "@/lib/utils";
import { getFilterPreferences } from "@/lib/actions/filter";

export default async function MassSelectionsPage(props: {
  searchParams: SearchParams;
}) {
  const filters = await props.searchParams;

  // Get saved preferences from cookies
  const savedPreferences = await getFilterPreferences("selections");

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
    SortBy.DATE;
  const order =
    getEnumByValue(SortOrder, filters["order"] || "") ||
    getEnumByValue(SortOrder, savedPreferences.order || "") ||
    SortOrder.DESC;

  const searchKey = [page, query, season, year].join("-");

  return (
    <div className="max-w-full w-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between assistant-open:lg:flex-col assistant-open:xl:flex-row">
        <div>
          <h2 className="text-3xl font-display text-foreground">
            Liturgical Selections
          </h2>
          <p className="text-muted-foreground mt-2">
            Plan and organize liturgical music with ease
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AssistantTrigger />
          <Link href="/liturgical-selections/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create Selection
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Search
          filterType="selections"
          query={query}
          placeholder="Search selections..."
        />
        <div className="flex gap-2">
          <QueryFilter
            filterType="selections"
            selected={season ?? "all"}
            queryName={"season"}
            items={seasonsFilter}
          />
          <QueryFilter
            filterType="selections"
            selected={year ?? "all"}
            queryName={"year"}
            items={yearsFilter}
          />
          <SortFilter filterType="selections" sortBy={sort_by} order={order} />
        </div>
      </div>

      <Suspense fallback={<MassSelectionListSkeleton />} key={searchKey}>
        <MassSelectionList
          filterType="selections"
          query={query}
          year={year}
          season={season}
          page={page}
          sortBy={sort_by}
          sortOrder={order}
          isPublic={true}
        />
      </Suspense>
    </div>
  );
}
