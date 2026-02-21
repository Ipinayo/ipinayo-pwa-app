import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

export default function AuthErrorLoading() {
  return (
    <div className="flex min-h-full w-full flex-col">
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <Skeleton className="h-12 w-[200px]" />
            </div>
            <div className="flex justify-center mb-4">
              <Skeleton className="h-14 w-14 rounded-full" />
            </div>
            <Skeleton className="h-8 w-48 mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
