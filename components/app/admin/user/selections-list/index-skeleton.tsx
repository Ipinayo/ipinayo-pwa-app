import MassSelectionCardSkeleton from "@/components/app/mass-selections/mass-selection-card/index-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SelectionsListSkeleton() {
  return (
    <>
      <div className="flex justify-between items-center">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <MassSelectionCardSkeleton key={`${i}`} />
          ))}
        </div>
      </div>
    </>
  );
}
