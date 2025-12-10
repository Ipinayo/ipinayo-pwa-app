import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

export default function StatisticsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Selections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Public Selections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Private Selections
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Skeleton className="h-10" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            This Month
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Skeleton className="h-10" />
        </CardContent>
      </Card>
    </div>
  );
}
