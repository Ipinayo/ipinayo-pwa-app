import StatsCardSkeleton from "@/components/common/stats-card/index-loading";

export default function UsersStatsSkeleton() {
  return (
    <div className="grid gap-4 xs:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((i) => (
        <StatsCardSkeleton key={`${i}`} />
      ))}
    </div>
  );
}
