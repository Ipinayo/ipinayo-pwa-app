import { Card, CardContent } from "@/components/ui/card";

import CreateSelectionTrigger from "@/components/common/create-selection-trigger";
import DraftCard from "@/components/app/draft-selections/draft-card";
import { DraftSelectionFilter } from "@/types/utils";
import { Music } from "lucide-react";
import { UrlPagination } from "@/components/common/url-pagination";
import { cn } from "@/lib/utils";
import { getAllDrafts } from "@/lib/actions/draft";

type DraftSelectionsListProps = DraftSelectionFilter & {
  className?: string;
};

export default async function DraftSelectionsList({
  className,
  ...filter
}: DraftSelectionsListProps) {
  const selectionsResponse = await getAllDrafts(filter);

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
            ? "Any drafts - incomplete selections - will appear here for you to continue later."
            : "Try adjusting your search to find what you're looking for."}
        </p>

        <CreateSelectionTrigger className="justify-center" />
      </CardContent>
    </Card>
  ) : (
    <>
      <div
        className={cn(
          className ??
            "grid gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 assistant-open:lg:grid-cols-2 assistant-open:xl:grid-cols-3",
        )}
      >
        {drafts.map((draft) => (
          <DraftCard key={draft.id} draft={draft} />
        ))}
      </div>

      <div className="mt-8">
        <UrlPagination
          currentPage={draftsPage.page}
          totalPages={draftsPage.pages}
        />
      </div>
    </>
  );
}
