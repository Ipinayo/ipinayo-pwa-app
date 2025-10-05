import { Card, CardContent } from "@/components/ui/card";
import { Music, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import MassSelectionCard from "./mass-selection-card";
import { MassSelectionFilter } from "@/types/utils";
import { UrlPagination } from "@/components/common/url-pagination";
import { getSelections } from "@/lib/actions/mass-selections";

export default async function MassSelectionList(filter: MassSelectionFilter) {
  const selectionsResponse = await getSelections(filter);

  const selectionsPage = selectionsResponse.pagination;
  const selections = selectionsResponse.selections;

  return selections.length === 0 ? (
    <Card className="text-center">
      <CardContent>
        <Music className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
        <h3 className="mb-2 text-xl font-semibold">
          No matching selections found
        </h3>
        <p className="text-muted-foreground mb-6">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        <Link href="/mass-selections/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Selection
          </Button>
        </Link>
      </CardContent>
    </Card>
  ) : (
    <>
      <div className="grid gap-6 lg:gap-3 xl:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {selections.map((selection) => (
          <MassSelectionCard key={selection.id} selection={selection} />
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
