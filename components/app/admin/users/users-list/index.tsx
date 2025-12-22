import { Card, CardContent } from "@/components/ui/card";

import Pagination from "../pagination";
import UserCard from "../user-card";
import { Users } from "lucide-react";
import { UsersFilter } from "@/types/utils";
import { getAllUsers } from "@/lib/actions/admin";

export default async function UsersList({
  ...filter
}: UsersFilter) {
  const usersResponse = await getAllUsers(filter);

  const usersPage = usersResponse.pagination;
  const users = usersResponse.users;

  const isDefaultFilter =
    filter.page === 1 && !filter.query?.trim() && !filter.userRole;

  return users.length === 0 ? (
    <Card className="text-center">
      <CardContent>
        <Users className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
        <h3 className="mb-2 text-xl font-semibold">
          {isDefaultFilter ? "No Users Yet" : "No matching users found"}
        </h3>
        <p className="text-muted-foreground mb-6">
          {isDefaultFilter
            ? ""
            : "Try adjusting your search or filters to find what you're looking for."}
        </p>
      </CardContent>
    </Card>
  ) : (
    <>
      <div
        className="grid gap-4 xs:grid-cols-2 lg:grid-cols-4"
      >
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      <div className="mt-8">
        <Pagination currentPage={usersPage.page} totalPages={usersPage.pages} />
      </div>
    </>
  );
}
