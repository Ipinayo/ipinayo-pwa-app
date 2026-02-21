import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSettingsLoading() {
  return (
    <div className="max-w-full w-full space-y-6">
      <div className="mb-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-80 mt-2" />
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-1.5">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="p-6 pt-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}
