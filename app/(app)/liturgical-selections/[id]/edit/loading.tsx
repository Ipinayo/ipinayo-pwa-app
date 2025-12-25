import { SaveFormSkeleton } from "@/components/app/mass-selections/edit-selection/index-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl w-full">
      <div className="mb-8 flex items-center gap-4">
        <Skeleton className="h-9 w-40 " />
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-28 mt-1" />
        </div>
      </div>

      <SaveFormSkeleton />
    </div>
  );
}
