import StatsCardSkeleton from "@/components/common/stats-card/index-loading";

export default function AnnouncementsStatsSkeleton() {
  return (
    <div className="grid gap-4 xs:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}
