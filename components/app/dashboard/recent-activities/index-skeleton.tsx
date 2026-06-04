import { Skeleton } from "@/components/ui/skeleton";

export default function RecentActivitiesSkeleton() {
  return (
    <>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="h-9 w-full mt-4" />
    </>
  );
}
