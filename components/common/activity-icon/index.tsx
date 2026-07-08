import {
  Activity,
  AtSign,
  BookOpen,
  LogOut,
  Megaphone,
  MessageSquare,
  User,
  UserCog2,
  UserMinus2,
  UserPlus2,
  Users2,
  Wrench,
} from "lucide-react";

import { cn } from "@/lib/utils";

export default function ActivityIcon({
  event,
  className,
}: Readonly<{ event: string; className?: string }>) {
  if (event.endsWith(".comment_mention")) {
    return <AtSign className={className} />;
  }

  if (event.endsWith(".commented")) {
    return <MessageSquare className={className} />;
  }

  if (event.startsWith("selection.")) {
    return <BookOpen className={className} />;
  }

  if (event.startsWith("draft.")) {
    return <BookOpen className={cn("text-amber-500", className)} />;
  }

  if (event.startsWith("user.")) {
    return <User className={className} />;
  }

  switch (event) {
    case "collaboration.added_to_group":
      return <UserPlus2 className={className} />;

    case "collaboration.removed_from_group":
      return <UserMinus2 className={className} />;

    case "collaboration.left_group":
    case "collaboration.left_group_by_self":
      return <LogOut className={className} />;

    case "collaboration.group_created_by_self":
    case "collaboration.group_deleted_by_self":
      return <Users2 className={className} />;

    case "collaboration.group_role_updated":
      return <UserCog2 className={className} />;

    case "system.announcement":
      return <Megaphone className={className} />;

    case "system.maintenance":
      return <Wrench className={className} />;

    default:
      return <Activity className={className} />;
  }
}
