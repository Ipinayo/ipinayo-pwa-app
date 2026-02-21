import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="rounded-lg border p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="rounded-lg border p-6 space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-36" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-72" />
            </div>
          </div>

          {/* Bio */}
          <div className="rounded-lg border p-6 space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Location & Parish */}
          <div className="rounded-lg border p-6 space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-36" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </div>

          {/* Musical Profile */}
          <div className="rounded-lg border p-6 space-y-6">
            <div className="space-y-1">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-28" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
