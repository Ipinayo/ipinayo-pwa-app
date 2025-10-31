import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Plus, Sparkles, TrendingUp } from "lucide-react";
import { LiturgicalSeason, LiturgicalYear } from "@/types/models";
import { SearchParams, SortBy, SortOrder } from "@/types/utils";
import { liturgicalSeasonItems, liturgicalYearItems } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import MassSelectionList from "@/components/app/mass-selections/mass-selection-list";
import MassSelectionListSkeleton from "@/components/app/mass-selections/mass-selection-list-skeleton";
import QueryFilter from "@/components/common/query-filter";
import SearchBar from "@/components/common/search-bar";
import SortFilter from "@/components/app/mass-selections/sort-filter";
import { Suspense } from "react";
import { auth } from "@/auth";
import { getEnumByValue } from "@/lib/utils";
import { getMassSelectionStats } from "@/lib/actions/mass-selections";
import { redirect } from "next/navigation";

const seasons = [
  { label: "All Seasons", value: "all" },
  ...liturgicalSeasonItems,
];
const years = [{ label: "All Years", value: "all" }, ...liturgicalYearItems];

export default async function DashboardPage(props: {
  searchParams: SearchParams;
}) {
  const session = await auth();

  if (!session?.user) redirect("/signin");

  const filters = await props.searchParams;

  const page = Number(filters["page"]) || 1;
  const query = filters["query"] || "";
  const season = getEnumByValue(LiturgicalSeason, filters["season"] || "");
  const year = getEnumByValue(LiturgicalYear, filters["year"] || "");
  const sort_by = getEnumByValue(SortBy, filters["sort_by"] || "");
  const order = getEnumByValue(SortOrder, filters["order"] || "");

  const searchKey = [page, query, season, year].join("-");

  const stats = await getMassSelectionStats();

  return (
    <div className="max-w-full w-full">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-display text-foreground mb-2">
          Welcome back, {session.user.name?.split(" ")[0] || session.user.email}
          !
        </h2>
        <p className="text-muted-foreground">
          Plan and organize your liturgical music.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Selections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Public Selections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.public || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Private Selections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.private || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <div className="text-3xl font-bold">{stats?.thisMonth || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {stats?.thisWeek || 0} this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-1 border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-transparent h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              My Templates
            </CardTitle>
            <CardDescription>Reusable mass selection templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Coming Soon Message */}
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-6 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <h4 className="font-semibold text-sm mb-2">Coming Soon</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Save your favorite mass selections as reusable templates.
                Perfect for recurring liturgies and your preferred musical
                styles.
              </p>
            </div>

            {/* Feature Preview */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Upcoming features:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Create templates from existing selections</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Share templates with other users</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Quick-start new selections from templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Template library with community contributions</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* My Selections Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Actions */}
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display text-foreground">
              My Liturgical Selections
            </h3>
            <Button asChild>
              <Link href="/mass-selections/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Selection
              </Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <SearchBar placeholder="Search selections..." />
            <div className="flex flex-col xs:flex-row gap-2">
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
              <SortFilter sortBy={sort_by} order={order} />
            </div>
          </div>

          <Suspense
            fallback={
              <MassSelectionListSkeleton className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3" />
            }
            key={searchKey}
          >
            <MassSelectionList
              query={query}
              year={year}
              season={season}
              page={page}
              sortBy={sort_by}
              sortOrder={order}
              userOnly={true}
              className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3"
              limit={8}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
