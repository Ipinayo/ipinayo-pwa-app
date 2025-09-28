import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import MassSelectionList from "@/components/app/mass-selections/mass-selection-list";
import MassSelectionListSkeleton from "@/components/app/mass-selections/mass-selection-list-skeleton";
import { Plus } from "lucide-react";
import QueryFilter from "@/components/common/query-filter";
import SearchBar from "@/components/common/search-bar";
import { SearchParams } from "@/types/utils";
import SortFilter from "@/components/app/mass-selections/sort-filter";
import { Suspense } from "react";
import { liturgicalSeasons } from "@/lib/constants";

const seasons = ["All Seasons", ...liturgicalSeasons];

export default async function MassSelectionsPage(props: {
  searchParams: SearchParams;
}) {
  const filters = await props.searchParams;

  const page = Number(filters["page"]) || 1;
  const query = filters["query"] || "";
  const season = filters["season"] || "All Seasons";
  const year = filters["year"] || "all";
  const sort_by = filters["sort_by"] || "updatedAt";
  const order = filters["order"] || "desc";

  const searchKey = [page, query, season, year].join("-");

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mass Selections</h1>
          <p className="text-muted-foreground mt-2">
            Manage your liturgical Mass plans
          </p>
        </div>
        <Link href="/mass-selections/new">
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
          <QueryFilter selected={season} queryName={"season"} items={seasons} />
          <QueryFilter
            selected={year}
            queryName={"year"}
            items={[
              { label: "All Years", value: "all" },
              { label: "Year A", value: "A" },
              { label: "Year B", value: "B" },
              { label: "Year C", value: "C" },
            ]}
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
        />
      </Suspense>
    </>
  );
}
