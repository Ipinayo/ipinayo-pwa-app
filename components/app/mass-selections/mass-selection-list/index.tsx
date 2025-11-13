import { Card, CardContent } from "@/components/ui/card";
import { Music, Plus } from "lucide-react";
import {
  getSelections,
  getUserSelections,
} from "@/lib/actions/mass-selections";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import MassSelectionCard from "../mass-selection-card";
import { MassSelectionFilter } from "@/types/utils";
import { UrlPagination } from "@/components/common/url-pagination";
import { cn } from "@/lib/utils";

type MassSelectionListProps = MassSelectionFilter & {
  userOnly?: boolean;
  className?: string;
};

export default async function MassSelectionList({
  userOnly = false,
  className,
  ...filter
}: MassSelectionListProps) {
  const selectionsResponse = userOnly
    ? await getUserSelections(filter)
    : await getSelections(filter);

  const selectionsPage = selectionsResponse.pagination;
  const selections = selectionsResponse.selections;

  const isDefaultFilter =
    filter.page === 1 &&
    !filter.query?.trim() &&
    !filter.season &&
    !filter.year;

  return selections.length === 0 ? (
    <Card className="text-center">
      <CardContent>
        <Music className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
        <h3 className="mb-2 text-xl font-semibold">
          {isDefaultFilter
            ? "No Liturgical Selections Yet"
            : "No matching selections found"}
        </h3>
        <p className="text-muted-foreground mb-6">
          {isDefaultFilter
            ? "Create your first selection to get started with liturgical planning."
            : "Try adjusting your search or filters to find what you're looking for."}
        </p>

        <Button asChild size="lg" className="gap-2">
          <Link href="/liturgical-selections/new">
            <Plus className="h-5 w-5" />
            Create Selection
          </Link>
        </Button>
      </CardContent>
    </Card>
  ) : (
    <>
      <div
        className={cn(
          className ??
            "grid gap-6 lg:gap-3 xl:gap-6 md:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {selections.map((selection) => (
          <MassSelectionCard
            key={selection.id}
            selection={selection}
            publicView={!userOnly}
          />
        ))}
      </div>

      <div className="mt-8">
        <UrlPagination
          currentPage={selectionsPage.page}
          totalPages={selectionsPage.pages}
        />
      </div>
    </>
  );
}
