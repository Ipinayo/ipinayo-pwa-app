import MassSelectionListSkeleton from "@/components/app/mass-selections/mass-selection-list/index-skeleton";
import SelectionsStatsSkeleton from "@/components/app/admin/selections/selections-stats/index-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SelectionsManagementLoading() {
  return (
    <div className="max-w-full w-full space-y-6">
      <div className="mb-8">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      <SelectionsStatsSkeleton />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <MassSelectionListSkeleton />
    </div>
  );
}
