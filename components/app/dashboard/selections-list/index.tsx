import { Card, CardContent } from "@/components/ui/card";
import { Music, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import MassSelectionCard from "../../mass-selections/mass-selection-card";
import { SortBy } from "@/types/utils";
import { getUserSelections } from "@/lib/actions/mass-selections";

export default async function SelectionsList() {
  const selectionsResponse = await getUserSelections({
    sortBy: SortBy.UPDATED_AT,
    limit: 4,
  });

  const selections = selectionsResponse.selections;

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg ">My Liturgical Selections</h3>
        {selectionsResponse.pagination.total > 4 && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/liturgical-selections">View All</Link>
          </Button>
        )}
      </div>

      {selections.length === 0 ? (
        <Card className="text-center">
          <CardContent>
            <Music className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="mb-2 text-xl font-semibold">
              No Liturgical Selections Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first selection to get started with liturgical
              planning.
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
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {selections.map((selection) => (
            <MassSelectionCard
              key={selection.id}
              selection={selection}
              publicView={false}
            />
          ))}
        </div>
      )}
    </>
  );
}
