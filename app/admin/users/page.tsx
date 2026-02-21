import { SearchParams, SortOrder, SortUsersBy } from "@/types/utils";

import QueryFilter from "@/components/common/query-filter";
import Search from "@/components/app/admin/users/search";
import SortFilter from "@/components/app/admin/users/sort-filter";
import { Suspense } from "react";
import { UserRole } from "@/types/models";
import UsersList from "@/components/app/admin/users/users-list";
import UsersListSkeleton from "@/components/app/admin/users/users-list/index-skeleton";
import UsersStats from "@/components/app/admin/users/users-stats";
import UsersStatsSkeleton from "@/components/app/admin/users/users-stats/index-skeleton";
import { getEnumByValue } from "@/lib/utils";
import { getFilterPreferences } from "@/lib/actions/filter";

const roles = [
  { label: "All Roles", value: "all" },
  { label: "Users", value: UserRole.USER },
  { label: "Admins", value: UserRole.ADMIN },
  { label: "Super Admins", value: UserRole.SUPERADMIN },
];

export default async function UsersManagementPage(props: {
  searchParams: SearchParams;
}) {
  const filters = await props.searchParams;

  // Get saved preferences from cookies
  const savedPreferences = await getFilterPreferences("admin_users");

  const page = Number(filters["page"]) || Number(savedPreferences.page) || 1;
  const query = filters["query"] || savedPreferences.query;
  const userRole =
    getEnumByValue(UserRole, filters["role"] || "") ||
    getEnumByValue(UserRole, savedPreferences.role || "");
  const sort_by =
    getEnumByValue(SortUsersBy, filters["sort_by"] || "") ||
    getEnumByValue(SortUsersBy, savedPreferences.sortBy || "") ||
    SortUsersBy.CREATED_AT;
  const order =
    getEnumByValue(SortOrder, filters["order"] || "") ||
    getEnumByValue(SortOrder, savedPreferences.order || "") ||
    SortOrder.DESC;

  const searchKey = [page, query, userRole].join("-");

  return (
    <div className="max-w-full w-full space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-display text-foreground">
          User Management
        </h2>
        <p className="text-muted-foreground mt-2">
          Manage and monitor all platform users
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<UsersStatsSkeleton />}>
        <UsersStats />
      </Suspense>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Search query={query} />
        <div className="flex gap-2">
          <QueryFilter
            filterType="admin_users"
            selected={userRole ?? "all"}
            queryName={"role"}
            items={roles}
          />
          <SortFilter sortBy={sort_by} order={order} />
        </div>
      </div>

      {/* Users List */}
      <Suspense fallback={<UsersListSkeleton />} key={searchKey}>
        <UsersList
          query={query}
          userRole={userRole}
          page={page}
          sortBy={sort_by}
          sortOrder={order}
        />
      </Suspense>
    </div>
  );
}
