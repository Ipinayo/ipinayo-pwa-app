import { Card, CardContent } from "@/components/ui/card";

import { Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import DraftCard from "../../drafts/draft-card";
import Link from "next/link";
import { getUserDrafts } from "@/lib/actions/admin";

export default async function DraftList({
  userId,
}: Readonly<{ userId: string }>) {
  const draftsResponse = await getUserDrafts(userId, { limit: 12 });

  const drafts = draftsResponse.drafts;

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg">Drafts</h3>
        {draftsResponse.pagination.total > 12 && (
          <Link href={`/admin/users/${userId}/drafts`}>
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
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {drafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
