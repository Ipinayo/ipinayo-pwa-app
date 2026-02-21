import { Skeleton } from "@/components/ui/skeleton";
import UsersListSkeleton from "@/components/app/admin/users/users-list/index-skeleton";
import UsersStatsSkeleton from "@/components/app/admin/users/users-stats/index-skeleton";

export default function UsersManagementLoading() {
  return (
    <div className="max-w-full w-full space-y-6">
      <div className="mb-8">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-52 mt-2" />
      </div>

      <UsersStatsSkeleton />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <UsersListSkeleton />
    </div>
  );
}
