import DraftCardSkeleton from "@/components/app/draft-selections/draft-card/index-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DraftListSkeleton() {
  return (
    <>
      <div className="flex justify-between items-center">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <DraftCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}
