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

      {/* Continue Draft section */}
      <div className="mb-8">
        <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="border-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/10 animate-pulse"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-muted rounded mb-2" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                  <div className="h-8 w-8 bg-muted rounded" />
                </div>
              </div>
              <div className="px-6 pb-6 space-y-2">
                <div className="h-3 w-16 bg-muted rounded" />
                <div className="h-9 w-full bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="my-8 border-t"></div>
      </div>

      {/* Create from Template section */}
      <div>
        <div className="h-6 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="border-2 rounded-lg p-6 animate-pulse">
              {/* Card header skeleton */}
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 h-14 w-14 bg-muted rounded-full" />
                <div className="h-6 w-32 bg-muted rounded mx-auto mb-2" />
                <div className="h-4 w-40 bg-muted rounded mx-auto" />
              </div>

              {/* Card content skeleton */}
              <div className="space-y-3">
                <div className="h-4 w-28 bg-muted rounded" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, partIndex) => (
                    <div key={partIndex} className="flex items-center">
                      <div className="w-2 h-2 bg-muted rounded-full mr-2" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  ))}
                </div>
                <div className="h-10 w-full bg-muted rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer text skeleton */}
      <div className="mt-8 text-center">
        <div className="h-4 w-80 bg-muted rounded mx-auto" />
      </div>
    </div>
  );
}
