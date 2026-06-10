import { Card, CardContent } from "@/components/ui/card";

import { Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateSelectionTrigger from "@/components/common/create-selection-trigger";
import DraftCard from "@/components/app/draft-selections/draft-card";
import Link from "next/link";
import { getAllDrafts } from "@/lib/actions/draft";

export default async function DraftList() {
  const draftsResponse = await getAllDrafts({ limit: 6 });

  const drafts = draftsResponse.drafts;

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg">My Drafts</h3>
        {draftsResponse.pagination.total > 6 && (
          <Link href="/dashboard/drafts">
            <Button variant="outline" size="sm">
              View all
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {drafts.length === 0 ? (
          <Card className="text-center">
            <CardContent>
              <Box className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <h3 className="mb-2 text-xl font-semibold">No Drafts Yet</h3>
              <p className="text-muted-foreground mb-6">
                Any drafts - incomplete selections - will appear here for you to
                continue later.
              </p>

              <CreateSelectionTrigger className="justify-center" />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 assistant-open:lg:grid-cols-2 assistant-open:xl:grid-cols-2">
            {drafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
