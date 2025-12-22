import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Metric } from "@/types/components/stats-card";
import { cn } from "@/lib/utils";

export function StatsCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  return (
    <Card key={metric.title} className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.title}
        </CardTitle>
        <Icon
          className={cn(
            "h-4 w-4",
            metric.color ? metric.color : "text-muted-foreground"
          )}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.value}</div>
        {metric.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {metric.description}
          </p>
        )}
        {metric.href && (
          <Link href={metric.href}>
            <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs">
              <Eye className="mr-1 h-3 w-3" />
              View Details
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
