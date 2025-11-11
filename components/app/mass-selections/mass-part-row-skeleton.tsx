import { Skeleton } from "@/components/ui/skeleton";

export default function MassPartRowSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
        {/* Part Content Skeleton */}
        <div className="flex-1 min-w-0 shrink-0">
          <div className="bg-card grid gap-4 rounded-lg border p-3 sm:p-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Part Name */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Key Signature */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            {/* Song Title */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>

        {/* Delete Button Skeleton */}
        <Skeleton className="h-9 w-9 shrink-0" />
      </div>

      {/* Insert Part Button Skeleton */}
      <div className="flex justify-end pl-10 sm:pl-12">
        <Skeleton className="h-7 w-20" />
      </div>
    </div>
  );
}
