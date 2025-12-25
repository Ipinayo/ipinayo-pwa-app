import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import MassSelectionCard from "@/components/app/mass-selections/mass-selection-card";
import { Music } from "lucide-react";
import { SortBy } from "@/types/utils";
import { getUserSelections } from "@/lib/actions/admin";

export default async function SelectionsList({
  userId,
}: Readonly<{ userId: string }>) {
  const selectionsResponse = await getUserSelections(userId, {
    sortBy: SortBy.UPDATED_AT,
    limit: 12,
  });

  const selections = selectionsResponse.selections;

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg ">Liturgical Selections</h3>
        {selectionsResponse.pagination.total > 12 && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/users/${userId}/liturgical-selections`}>
              View All
            </Link>
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
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:gap-3 xl:gap-6 md:grid-cols-2 lg:grid-cols-3">
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
