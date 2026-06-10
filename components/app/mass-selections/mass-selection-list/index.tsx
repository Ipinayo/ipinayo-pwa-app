import { Card, CardContent } from "@/components/ui/card";
import {
  getSelections,
  getUserSelections,
} from "@/lib/actions/mass-selections";

import CreateSelectionTrigger from "@/components/common/create-selection-trigger";
import MassSelectionCard from "../mass-selection-card";
import { MassSelectionFilter } from "@/types/utils";
import { Music } from "lucide-react";
import Pagination from "../pagination";
import { cn } from "@/lib/utils";
import { getUserSelections as getUserSelectionsAdmin } from "@/lib/actions/admin";

type MassSelectionListProps = MassSelectionFilter & {
  filterType?: "selections" | "dashboard" | "admin_selections";
  userOnly?: boolean;
  userId?: string;
  className?: string;
};

export default async function MassSelectionList({
  filterType,
  userOnly = false,
  userId,
  className,
  ...filter
}: MassSelectionListProps) {
  const selectionsResponse = userId
    ? await getUserSelectionsAdmin(userId, filter)
    : userOnly
      ? await getUserSelections(filter)
      : await getSelections(filter);

  const selectionsPage = selectionsResponse.pagination;
  const selections = selectionsResponse.selections;

  const isDefaultFilter =
    filter.page === 1 &&
    !filter.query?.trim() &&
    !filter.season &&
    !filter.year &&
    filter.isPublic === undefined;

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

        <CreateSelectionTrigger className="justify-center" />
      </CardContent>
    </Card>
  ) : (
    <>
      <div
        className={cn(
          className ??
            "grid gap-6 lg:gap-3 xl:gap-6 md:grid-cols-2 lg:grid-cols-3",
          userOnly
            ? "assistant-open:lg:grid-cols-2"
            : "assistant-open:lg:grid-cols-1 assistant-open:xl:grid-cols-2",
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
        <Pagination
          filterType={filterType}
          currentPage={selectionsPage.page}
          totalPages={selectionsPage.pages}
        />
      </div>
    </>
  );
}
