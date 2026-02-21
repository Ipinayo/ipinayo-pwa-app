import DraftSelectionListSkeleton from "@/components/app/draft-selections/draft-selections-list/index-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DraftsLoading() {
  return (
    <div className="max-w-full w-full">
      <Skeleton className="h-5 w-36 mb-4" />

      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-11 w-44" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-10 w-full" />
      </div>

      <DraftSelectionListSkeleton />
    </div>
  );
}
