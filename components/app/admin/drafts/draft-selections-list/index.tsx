import { Card, CardContent } from "@/components/ui/card";
import { getAllDrafts, getUserDrafts } from "@/lib/actions/admin";

import DraftCard from "../draft-card";
import { DraftSelectionFilter } from "@/types/utils";
import { Music } from "lucide-react";
import Pagination from "../pagination";
import { cn } from "@/lib/utils";

type DraftSelectionsListProps = DraftSelectionFilter & {
  userId?: string;
  saveFilter?: boolean;
  className?: string;
};

export default async function DraftSelectionsList({
  userId,
  saveFilter = true,
  className,
  ...filter
}: DraftSelectionsListProps) {
  const selectionsResponse = userId
    ? await getUserDrafts(userId, filter)
    : await getAllDrafts(filter);

  const draftsPage = selectionsResponse.pagination;
  const drafts = selectionsResponse.drafts;

  const isDefaultFilter = filter.page === 1 && !filter.query?.trim();

  return drafts.length === 0 ? (
    <Card className="text-center">
      <CardContent>
        <Music className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
        <h3 className="mb-2 text-xl font-semibold">
          {isDefaultFilter ? "No Drafts Yet" : "No matching drafts found"}
        </h3>
        <p className="text-muted-foreground mb-6">
          {isDefaultFilter
            ? ""
            : "Try adjusting your search to find what you're looking for."}
        </p>
      </CardContent>
    </Card>
  ) : (
    <>
      <div
        className={cn(
          className ?? "grid gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}
      >
        {drafts.map((draft) => (
          <DraftCard key={draft.id} draft={draft} />
        ))}
      </div>

      <div className="mt-8">
        <Pagination
          saveFilter={saveFilter}
          currentPage={draftsPage.page}
          totalPages={draftsPage.pages}
        />
      </div>
    </>
  );
}
