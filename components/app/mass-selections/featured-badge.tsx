import { Badge } from "@/components/ui/badge";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Marks a selection as part of the curated featured bank (published by a
// featured author). Used on cards and the selection detail page.
export default function FeaturedBadge({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <Badge className={cn("", className)} variant="default">
      <BadgeCheck className="h-3 w-3" />
      Featured
    </Badge>
  );
}
