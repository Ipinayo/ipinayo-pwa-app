import { Card, CardContent, CardHeader } from "@/components/ui/card";

import MassSelectionListSkeleton from "@/components/app/mass-selections/mass-selection-list-skeleton";

export default function Loading() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mass Selections</h1>
          <p className="text-muted-foreground mt-2">
            Manage your liturgical Mass plans
          </p>
        </div>
      </div>

      <MassSelectionListSkeleton />
    </div>
  );
}
