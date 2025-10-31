import BackButton from "@/components/common/back-button";
import { SaveFormSkeleton } from "@/components/app/mass-selections/save-form-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <BackButton
            to="/liturgical-selections/new"
            backText="Back to Templates"
          />
          <div>
            <h1 className="text-3xl font-bold">Create Liturgical Selection</h1>
            <Skeleton className="h-4 w-28 mt-1" />
          </div>
        </div>

        <SaveFormSkeleton />
      </div>
    </div>
  );
}
