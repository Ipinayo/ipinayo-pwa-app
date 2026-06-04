import ActivityListSkeleton from "@/components/app/admin/activity/activity-list/index-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityLogsLoading() {
  return (
    <div className="max-w-full w-full space-y-6">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <ActivityListSkeleton />
    </div>
  );
}
