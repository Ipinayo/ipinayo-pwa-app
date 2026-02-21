import DraftSelectionListSkeleton from "@/components/app/admin/drafts/draft-selections-list/index-skeleton";
import DraftsStatsSkeleton from "@/components/app/admin/drafts/drafts-stats/index-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DraftsManagementLoading() {
  return (
    <div className="max-w-full w-full space-y-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-4 w-52 mt-2" />
      </div>

      <DraftsStatsSkeleton />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <DraftSelectionListSkeleton />
    </div>
  );
}
