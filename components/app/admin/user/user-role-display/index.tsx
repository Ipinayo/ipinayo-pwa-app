import { Button } from "@/components/ui/button";
import DeleteUser from "../delete-user";
import { ShieldUser } from "lucide-react";
import ToggleAdmin from "../toggle-admin";
import ToggleFeaturedAuthor from "../toggle-featured-author";
import { UserRole } from "@/types/models";
import { getUser as getCurrentUser } from "@/lib/actions/user";
import { getUser } from "@/lib/actions/admin";
import { isAdmin } from "@/lib/utils";

export default async function UserRoleDisplay({
  userId,
}: Readonly<{ userId: string }>) {
  const user = await getUser(userId);
  const currentUser = await getCurrentUser();

  if (!user) return <p className="text-destructive">User not found!!.</p>;

  if (user.userRole === UserRole.SUPERADMIN)
    return (
      <Button variant="outline" size="sm">
        <ShieldUser className="mr-2 h-4 w-4" />
        Super Admin
      </Button>
    );

  const userIsAdmin = isAdmin(user.userRole);
  const userIsFeatured = user.userRole === UserRole.FEATURED_AUTHOR;
  const username = user.name || user.email;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {!userIsFeatured && (
        <ToggleAdmin
          userId={userId}
          isAdmin={userIsAdmin}
          username={username}
        />
      )}
      {!userIsAdmin && (
        <ToggleFeaturedAuthor
          userId={userId}
          isFeaturedAuthor={userIsFeatured}
          username={username}
        />
      )}
      {currentUser?.userRole === UserRole.SUPERADMIN && (
        <DeleteUser userId={userId} username={username} />
      )}
    </div>
  );
}
