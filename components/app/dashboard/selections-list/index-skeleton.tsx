import MassSelectionCardSkeleton from "../../mass-selections/mass-selection-card/index-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SelectionsListSkeleton() {
  return (
    <>
      <div className="flex justify-between items-center">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3 assistant-open:lg:grid-cols-1 assistant-open:xl:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <MassSelectionCardSkeleton key={`${i}`} />
          ))}
        </div>
      </div>
    </>
  );
}
