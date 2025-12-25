import { Button } from "@/components/ui/button";
import { ShieldUser } from "lucide-react";
import ToggleAdmin from "../toggle-admin";
import { UserRole } from "@/types/models";
import { getUser } from "@/lib/actions/admin";
import { isAdmin } from "@/lib/utils";

export default async function UserRoleDisplay({
  userId,
}: Readonly<{ userId: string }>) {
  const user = await getUser(userId);

  if (!user) return <p className="text-destructive">User not found!!.</p>;

  if (user.userRole === UserRole.SUPERADMIN)
    return (
      <Button variant="outline" size="sm">
        <ShieldUser className="mr-2 h-4 w-4" />
        Super Admin
      </Button>
    );

  return (
    <ToggleAdmin
      userId={userId}
      isAdmin={isAdmin(user.userRole)}
      username={user.name || user.email}
    />
  );
}
