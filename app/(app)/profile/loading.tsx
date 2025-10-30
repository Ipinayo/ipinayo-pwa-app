import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-4 justify-between mb-8">
          <div className="h-10 w-20 bg-muted "></div>
          <div className="h-8 w-64 bg-muted "></div>
        </div>

        {/* Profile Header Loading */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-24 w-24 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-8 w-48 bg-muted rounded"></div>
                <div className="h-4 w-64 bg-muted rounded"></div>
                <div className="h-4 w-56 bg-muted rounded"></div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Basic Information Loading */}
        <Card>
          <CardHeader>
            <div className="h-6 w-40 bg-muted rounded"></div>
            <div className="h-4 w-64 bg-muted rounded"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-16 bg-muted rounded"></div>
                <div className="h-5 w-32 bg-muted rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-12 bg-muted rounded"></div>
                <div className="h-5 w-48 bg-muted rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-5 w-40 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>

        {/* Bio Loading */}
        <Card>
          <CardHeader>
            <div className="h-6 w-12 bg-muted rounded"></div>
            <div className="h-4 w-20 bg-muted rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-3/4 bg-muted rounded"></div>
              <div className="h-4 w-1/2 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>

        {/* Musical Profile Loading */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-muted rounded"></div>
              <div className="h-6 w-32 bg-muted rounded"></div>
            </div>
            <div className="h-4 w-56 bg-muted rounded"></div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded"></div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 w-16 bg-muted rounded-full"></div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded"></div>
              <div className="h-5 w-32 bg-muted rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-muted rounded"></div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 w-20 bg-muted rounded-full"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Parish Loading */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-muted rounded"></div>
              <div className="h-6 w-48 bg-muted rounded"></div>
            </div>
            <div className="h-4 w-72 bg-muted rounded"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-5 w-40 bg-muted rounded"></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-5 w-36 bg-muted rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-muted rounded"></div>
                <div className="h-5 w-28 bg-muted rounded"></div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-28 bg-muted rounded"></div>
                <div className="h-5 w-32 bg-muted rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-12 bg-muted rounded"></div>
                <div className="h-5 w-24 bg-muted rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-8 w-48 bg-muted rounded"></div>
            <div className="h-4 w-32 bg-muted rounded"></div>
          </CardHeader>
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
