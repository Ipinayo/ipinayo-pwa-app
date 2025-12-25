import StatsCardSkeleton from "@/components/common/stats-card/index-loading";

export default function DraftsStatsSkeleton() {
  return (
    <div className="grid gap-4 xs:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={`${i}`} />
      ))}
    </div>
  );
}
