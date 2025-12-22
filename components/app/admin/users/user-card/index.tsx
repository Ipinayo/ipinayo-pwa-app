import { BookOpen, Eye, ShieldUser } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User } from "@/types/models";
import UserAvatar from "@/components/common/user-avatar";
import { isAdmin } from "../../../../../lib/utils";

export default function UserCard({ user }: { user: User }) {
  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardHeader className="flex flex-row gap-3 w-full">
        <UserAvatar user={user} className="h-12 w-12" />
        <div className="flex flex-col gap-0 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{user.name || "Anonymous"}</p>
            {isAdmin(user.userRole) && (
              <Badge variant="secondary" className="gap-1 flex-none">
                <ShieldUser className="h-3 w-3" />
                Admin
              </Badge>
            )}
            {/* {user.status === "disabled" && (
              <Badge variant="destructive">Disabled</Badge>
            )} */}
          </div>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {user._count.selections} selections
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-amber-500" />
            {user._count.massSelectionDrafts} drafts
          </span>
        </div>

        <Link href={`/admin/users/${user.id}`}>
          <Button size="sm" variant="outline" className="mt-3 h-7 px-2 text-xs">
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
