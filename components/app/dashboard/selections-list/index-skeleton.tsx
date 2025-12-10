import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

export default function SelectionsListSkeleton() {
  return (
    <>
      <div className="flex justify-between items-center">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="bg-muted h-6 w-3/4 rounded"></div>
                <div className="bg-muted h-4 w-1/2 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-muted h-4 rounded"></div>
                  <div className="bg-muted h-4 w-2/3 rounded"></div>
                  <div className="flex gap-2">
                    <div className="bg-muted h-8 w-20 rounded"></div>
                    <div className="bg-muted h-8 w-20 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
