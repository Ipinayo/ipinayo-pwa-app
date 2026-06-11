import { LiturgicalSeason, LiturgicalYear } from "@/lib/generated/prisma/client";
import { Params, SearchParams, SortBy, SortOrder } from "@/types/utils";
import { seasonsFilter, typesFilter, yearsFilter } from "@/lib/constants";

import BackButton from "@/components/common/back-button";
import MassSelectionList from "@/components/app/mass-selections/mass-selection-list";
import MassSelectionListSkeleton from "@/components/app/mass-selections/mass-selection-list/index-skeleton";
import QueryFilter from "@/components/common/query-filter";
import Search from "@/components/app/mass-selections/search";
import SortFilter from "@/components/app/mass-selections/sort-filter";
import { Suspense } from "react";
import { getEnumByValue } from "@/lib/utils";
import { stringToBoolean } from "../../../../../lib/utils";

export default async function UserSelectionsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  const userId = params.id;

  const filters = await props.searchParams;

  const page = Number(filters["page"]) || 1;
  const query = filters["query"];
  const season = getEnumByValue(LiturgicalSeason, filters["season"] || "");
  const year = getEnumByValue(LiturgicalYear, filters["year"] || "");
  const sort_by =
    getEnumByValue(SortBy, filters["sort_by"] || "") || SortBy.UPDATED_AT;
  const order =
    getEnumByValue(SortOrder, filters["order"] || "") || SortOrder.DESC;
  const isPublic = filters["public"];

  const searchKey = [page, query, season, year].join("-");

  return (
    <div className="max-w-full w-full">
      <BackButton to={`/admin/users/${userId}`} backText="Back to User Page" />
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-display text-foreground">
          User Liturgical Selections
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Search query={query} placeholder="Search user selections..." />
        <div className="flex gap-2">
          <QueryFilter
            selected={isPublic ?? "all"}
            queryName={"public"}
            items={typesFilter}
          />
          <QueryFilter
            selected={season ?? "all"}
            queryName={"season"}
            items={seasonsFilter}
          />
          <QueryFilter
            selected={year ?? "all"}
            queryName={"year"}
            items={yearsFilter}
          />
          <SortFilter sortBy={sort_by} order={order} />
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
          userOnly={true}
          userId={userId}
          isPublic={stringToBoolean(isPublic)}
        />
      </Suspense>
    </div>
  );
}
