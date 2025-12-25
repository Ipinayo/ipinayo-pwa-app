import StatsCardSkeleton from "@/components/common/stats-card/index-loading";

export default function SelectionsStatsSkeleton() {
  return (
    <div className="grid gap-4 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StatsCardSkeleton key={`${i}`} />
      ))}
    </div>
  );
}
