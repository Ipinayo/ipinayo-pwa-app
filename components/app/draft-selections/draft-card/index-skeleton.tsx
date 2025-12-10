import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

export default function DraftCardSkeleton() {
  return (
    <Card className="border-2 bg-amber-50/50 dark:bg-amber-950/10">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}
