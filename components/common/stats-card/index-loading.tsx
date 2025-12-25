import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-24 mt-2" />
      </CardContent>
    </Card>
  );
}
