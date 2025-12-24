import DraftCardSkeleton from "@/components/app/draft-selections/draft-card/index-skeleton";

export default function DraftSelectionListSkeleton() {
  return (
    <div className="grid gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <DraftCardSkeleton key={`${i}`} />
      ))}
    </div>
  );
}
