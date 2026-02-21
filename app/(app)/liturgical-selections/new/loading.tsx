import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

export default function SelectLiturgyTemplateLoading() {
  return (
    <div className="mx-auto max-w-4xl w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="my-8 border-t"></div>
      </div>

      <div>
        <Skeleton className="h-7 w-48 mb-4" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-2">
              <CardHeader className="text-center items-center">
                <Skeleton className="h-14 w-14 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36 mb-2" />
                  <div className="space-y-1">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    ))}
                  </div>
                </div>
                <Skeleton className="h-9 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
    </div>
  );
}
