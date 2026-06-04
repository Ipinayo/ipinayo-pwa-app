import ActivityFilters from "@/components/app/admin/activity/activity-filters";
import ActivityList from "@/components/app/admin/activity/activity-list";
import ActivityListSkeleton from "@/components/app/admin/activity/activity-list/index-skeleton";
import { SearchParams } from "@/types/utils";
import { Suspense } from "react";

export default async function ActivityLogsPage(
  props: Readonly<{ searchParams: SearchParams }>,
) {
  const filters = await props.searchParams;
  const page = Number(filters["page"]) || 1;
  const type = (filters["type"] as string) || "all";
  const event = (filters["event"] as string) || "all";

  const entityTypeFilter = type === "all" ? undefined : type;
  const eventFilter = event === "all" ? undefined : event;

  const searchKey = [page, type, event].join("-");

  return (
    <div className="max-w-full w-full space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-display text-foreground">Activity Logs</h2>
        <p className="text-muted-foreground mt-2">
          A record of actions across the platform
        </p>
      </div>

      <ActivityFilters entityType={type} event={event} />

      <Suspense fallback={<ActivityListSkeleton />} key={searchKey}>
        <ActivityList
          page={page}
          entityType={entityTypeFilter}
          event={eventFilter}
        />
      </Suspense>
    </div>
  );
}
