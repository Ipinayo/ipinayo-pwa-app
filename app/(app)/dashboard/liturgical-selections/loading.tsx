import MassSelectionListSkeleton from "@/components/app/mass-selections/mass-selection-list/index-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function LiturgicalSelectionsLoading() {
  return (
    <div className="max-w-full w-full">
      {/* Back Button */}
      <Skeleton className="h-5 w-36 mb-4" />

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-11 w-44" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-10 flex-1" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      <MassSelectionListSkeleton />
    </div>
  );
}
