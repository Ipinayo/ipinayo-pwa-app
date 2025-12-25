import { SaveFormSkeleton } from "@/components/app/mass-selections/edit-selection/index-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl w-full">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div className="h-9 w-9 bg-muted rounded-md animate-pulse" />
        <div>
          <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <SaveFormSkeleton />
    </div>
  );
}
