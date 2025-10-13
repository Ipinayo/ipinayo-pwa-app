import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl w-full">
      <div className="animate-pulse space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-10 w-20 bg-muted rounded"></div>
          <div className="h-8 w-64 bg-muted rounded"></div>
        </div>

        <Card>
          <CardHeader>
            <div className="h-8 w-48 bg-muted rounded"></div>
            <div className="h-4 w-32 bg-muted rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-3/4 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-full bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
