import UserCardSkeleton from "../user-card/index-skeleton";

export default function UsersListSkeleton() {
  return (
    <div className="grid gap-4 xs:grid-cols-2 lg:grid-cols-4">
      {[...Array(12)].map((i) => (
        <UserCardSkeleton key={`${i}`} />
      ))}
    </div>
  );
}
