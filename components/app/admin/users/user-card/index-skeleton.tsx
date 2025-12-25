import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserCardSkeleton() {
    return (
        <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row gap-3 w-full">
                <Skeleton className="h-12 w-12 rounded-full flex-none" />
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-12 rounded" />
                    </div>
                    <Skeleton className="h-3 w-48" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 text-xs">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-7 w-28 rounded mt-3" />
            </CardContent>
        </Card>
    );
}