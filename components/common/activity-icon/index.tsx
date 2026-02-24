import { Activity, BookOpen, Megaphone, User } from "lucide-react";

import { cn } from "@/lib/utils";

export default function ActivityIcon({
  event,
  className,
}: Readonly<{ event: string; className?: string }>) {
  switch (event) {
    case "selection.created_by_self":
      return <BookOpen className={className} />;
    case "selection.cloned_by_self":
      return <BookOpen className={className} />;
    case "selection.cloned_by_other":
      return <BookOpen className={className} />;
    case "selection.updated_by_self":
      return <BookOpen className={className} />;
    case "selection.deleted_by_self":
      return <BookOpen className={className} />;
    case "user.registered":
      return <User className={className} />;
    case "user.updated":
      return <User className={className} />;
    case "draft.created_by_self":
      return <BookOpen className={cn("text-amber-500", className)} />;
    case "draft.updated_by_self":
      return <BookOpen className={cn("text-amber-500", className)} />;
    case "draft.deleted_by_other":
      return <BookOpen className={cn("text-amber-500", className)} />;
    case "draft.deleted_by_self":
      return <BookOpen className={cn("text-amber-500", className)} />;
    case "draft.expired":
      return <BookOpen className={cn("text-amber-500", className)} />;
    case "draft.expiring":
      return <BookOpen className={cn("text-amber-500", className)} />;
    case "system.announcement":
      return <Megaphone className={className} />;
    default:
      return <Activity className={className} />;
  }
}
