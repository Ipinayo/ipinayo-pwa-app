import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import MassSelectionListSkeleton from "@/components/app/mass-selections/mass-selection-list/index-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-full w-full">
      {/* Welcome Section */}
      <div className="mb-8">
        <Skeleton className="h-10" />
        <p className="text-muted-foreground">
          Manage and create beautiful liturgical music plans
        </p>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-1 border-2 border-dashed border-primary/20 bg-linear-to-br from-primary/5 to-transparent h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-10" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-10" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24" />
          </CardContent>
        </Card>

        {/* My Selections Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Actions */}
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display text-foreground">
              My Liturgical Selections
            </h3>
            <Skeleton className="h-10" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Skeleton className="h-7 w-auto" />
            <div className="flex flex-col xs:flex-row gap-2">
              <Skeleton className="h-10 w-auto" />
              <Skeleton className="h-10 w-auto" />
              <Skeleton className="h-10 w-auto" />
            </div>
          </div>

          <MassSelectionListSkeleton className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3" />
        </div>
      </div>
    </div>
  );
}
