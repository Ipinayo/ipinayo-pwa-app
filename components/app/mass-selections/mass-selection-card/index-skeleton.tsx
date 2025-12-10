import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

export default function MassSelectionCardSkeleton() {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-16 ml-2" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex h-full flex-col">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>

          <div className="flex items-center justify-between text-sm gap-5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="flex items-center justify-between text-sm gap-5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        <div className="flex gap-2 pt-2 mt-auto">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/50 flex flex-col gap-1">
        <div className="grid grid-cols-2 gap-4 text-xs w-full">
          <div className="flex items-start gap-2 min-w-0">
            <Skeleton className="h-3.5 w-3.5 rounded shrink-0 mt-0.5" />
            <div className="min-w-0 space-y-1 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <div className="flex items-start gap-2 min-w-0">
            <Skeleton className="h-3.5 w-3.5 rounded shrink-0 mt-0.5" />
            <div className="min-w-0 space-y-1 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs w-full">
          <div className="flex items-start gap-2 min-w-0">
            <Skeleton className="h-3.5 w-3.5 rounded shrink-0 mt-0.5" />
            <div className="min-w-0 space-y-1 flex-1">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <div className="flex items-start gap-2 min-w-0">
            <Skeleton className="h-3.5 w-3.5 rounded shrink-0 mt-0.5" />
            <div className="min-w-0 space-y-1 flex-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
