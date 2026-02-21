import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

export default function VerifyRequestLoading() {
  return (
    <div className="flex min-h-full w-full flex-col">
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Skeleton className="h-12 w-[200px]" />
            </div>
            <div className="flex justify-center">
              <Skeleton className="w-16 h-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-48 mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-center">
              <Skeleton className="h-4 w-40 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="pt-4">
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
