import DraftCardSkeleton from "@/components/common/draft-card/index-skeleton";

export default function DraftSelectionListSkeleton() {
  return (
    <div className="grid gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(12)].map((i) => (
        <DraftCardSkeleton key={`${i}`} />
      ))}
    </div>
  );
}
