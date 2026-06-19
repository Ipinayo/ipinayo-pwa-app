import { getSharedDrafts, getSharedSelections } from "@/lib/actions/collaboration";

import { Card, CardContent } from "@/components/ui/card";
import DraftCard from "@/components/app/draft-selections/draft-card";
import MassSelectionCard from "@/components/app/mass-selections/mass-selection-card";
import { Users } from "lucide-react";

export default async function SharedWithMe() {
  const [selectionsResponse, draftsResponse] = await Promise.all([
    getSharedSelections({ limit: 4 }),
    getSharedDrafts({ limit: 4 }),
  ]);

  const selections = selectionsResponse.selections;
  const drafts = draftsResponse.drafts;

  if (selections.length === 0 && drafts.length === 0) {
    return (
      <Card className="text-center">
        <CardContent>
          <Users className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
          <h3 className="mb-2 text-xl font-semibold">Nothing shared yet</h3>
          <p className="text-muted-foreground">
            When someone shares a selection or draft with you, it will appear
            here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {selections.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg">Selections shared with me</h3>
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3 assistant-open:lg:grid-cols-2">
            {selections.map((selection) => (
              <MassSelectionCard
                key={selection.id}
                selection={selection}
                publicView={false}
              />
            ))}
          </div>
        </div>
      )}

      {drafts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg">Drafts shared with me</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 assistant-open:lg:grid-cols-2">
            {drafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
