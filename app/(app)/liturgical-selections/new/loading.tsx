export default function Loading() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="h-9 w-9 bg-muted rounded-md animate-pulse" />
          <div>
            <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Cards grid skeleton */}
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

        {/* Footer text skeleton */}
        <div className="mt-8 text-center">
          <div className="h-4 w-80 bg-muted rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}
