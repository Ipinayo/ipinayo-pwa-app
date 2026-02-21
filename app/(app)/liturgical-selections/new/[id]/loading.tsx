import { SaveFormSkeleton } from "@/components/app/mass-selections/edit-selection/index-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateMassSelectionLoading() {
  return (
    <div className="mx-auto max-w-4xl w-full">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>

      <SaveFormSkeleton />
    </div>
  );
}
