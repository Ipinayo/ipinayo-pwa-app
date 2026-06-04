import { Card, CardContent } from "@/components/ui/card";

import { Activity as ActivityIcon } from "lucide-react";
import AdminActivityRow from "../activity-row";
import { UrlPagination } from "@/components/common/url-pagination";
import { getAllActivities } from "@/lib/actions/admin";

export default async function ActivityList({
  page,
  entityType,
  event,
}: {
  page: number;
  entityType?: string;
  event?: string;
}) {
  const { activities, pagination } = await getAllActivities({
    page,
    entityType,
    event,
  });

  if (activities.length === 0) {
    return (
      <Card className="text-center">
        <CardContent className="py-12">
          <ActivityIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-semibold">No activities found</h3>
          <p className="text-muted-foreground">
            No activities match the current filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        {pagination.total} {pagination.total === 1 ? "activity" : "activities"}
      </p>

      <div className="space-y-3">
        {activities.map((activity) => (
          <AdminActivityRow key={activity.id} activity={activity} />
        ))}
      </div>

      <div className="mt-6">
        <UrlPagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
        />
      </div>
    </>
  );
}
