import { AdminMassSelectionDraft, MassSelectionDraft } from "@/types/models";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DeleteButton from "../delete-button";
import { differenceInDays } from "date-fns";
import { formatDate } from "@/lib/utils";

export default function DraftCard({
  draft,
}: Readonly<{ draft: AdminMassSelectionDraft | MassSelectionDraft }>) {
  const age = differenceInDays(new Date(), new Date(draft.updatedAt));

  return (
    <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-amber-400 bg-amber-50/50 dark:bg-amber-950/10">
      <CardHeader>
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="flex-1 ">
            <CardTitle className="text-base line-clamp-2">
              {draft.title || "Untitled Draft"}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Last updated: {formatDate(draft.updatedAt)}
              {"createdBy" in draft &&
                draft.createdBy &&
                ` by ${draft.createdBy.name || draft.createdBy.email}`}
            </CardDescription>
          </div>
          {age >= 15 && (
            <Badge variant={"outline"} className="gap-1 text-destructive">
              <AlertCircle className="h-3 w-3" />
              {age} days old
            </Badge>
          )}
          <DeleteButton
            draftId={draft.id}
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mt-1 -mr-2"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {Array.isArray(draft.parts) ? draft.parts.length : 0} part(s)
        </p>
      </CardContent>
    </Card>
  );
}
