import DraftSelectionListSkeleton from "@/components/app/admin/drafts/draft-selections-list/index-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserDraftsLoading() {
  return (
    <div className="max-w-full w-full">
      {/* Back Button */}
      <Skeleton className="h-9 w-36 mb-4" />

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-9 w-64" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-10 w-full sm:w-64" />
      </div>

      <DraftSelectionListSkeleton />
    </div>
  );
}
