import { Button } from "@/components/ui/button";
import DeleteUser from "../delete-user";
import { ShieldUser } from "lucide-react";
import ToggleAdmin from "../toggle-admin";
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

  if (currentUser?.userRole === UserRole.SUPERADMIN)
    return (
      <div className="flex items-center gap-2">
        <ToggleAdmin
          userId={userId}
          isAdmin={isAdmin(user.userRole)}
          username={user.name || user.email}
        />
        <DeleteUser userId={userId} username={user.name || user.email} />
      </div>
    );

  return (
    <ToggleAdmin
      userId={userId}
      isAdmin={isAdmin(user.userRole)}
      username={user.name || user.email}
    />
  );
}
