import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-full w-full space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-display text-foreground">
          Admin Settings
        </h2>
        <p className="text-muted-foreground mt-2">
          Configure admin panel preferences and settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Future Settings</CardTitle>
          <CardDescription>
            Additional configuration options will be available here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Coming Soon</Badge>
            <p className="text-sm text-muted-foreground">
              Admin settings and preferences
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
