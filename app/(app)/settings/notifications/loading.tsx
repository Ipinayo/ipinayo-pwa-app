import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationSettingsLoading() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>

        <div className="space-y-8">
          {[0, 1].map((card) => (
            <Card key={card}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                    <div className="flex gap-6">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
