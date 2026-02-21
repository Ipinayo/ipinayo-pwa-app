import SelectionsListSkeleton from "@/components/app/dashboard/selections-list/index-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import StatisticsSkeleton from "@/components/app/dashboard/statistics/index-skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-full w-full">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-5 w-full justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-11 w-40" />
        </div>
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      <StatisticsSkeleton />

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-10 w-full" />
          <SelectionsListSkeleton />
        </div>

        <Skeleton className="lg:col-span-1 h-80" />
      </div>
    </div>
  );
}
