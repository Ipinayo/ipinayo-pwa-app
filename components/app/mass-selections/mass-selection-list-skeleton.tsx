import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function MassSelectionListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
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
  );
}
