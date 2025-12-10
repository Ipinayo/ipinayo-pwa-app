import { Box, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import DraftCard from "@/components/common/draft-card";
import Link from "next/link";
import { getAllDrafts } from "@/lib/actions/draft";

export default async function DraftList() {
  const drafts = await getAllDrafts();

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg">My Drafts</h3>
        {drafts.length > 6 && (
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

              <Button asChild size="lg" className="gap-2">
                <Link href="/liturgical-selections/new">
                  <Plus className="h-5 w-5" />
                  Create Selection
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {drafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
