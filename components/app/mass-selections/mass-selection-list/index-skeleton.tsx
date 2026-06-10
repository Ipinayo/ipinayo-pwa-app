import MassSelectionCardSkeleton from "../mass-selection-card/index-skeleton";
import { cn } from "@/lib/utils";

export default function MassSelectionListSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        className ??
          "grid gap-6 md:grid-cols-2 lg:grid-cols-3 assistant-open:lg:grid-cols-2",
      )}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <MassSelectionCardSkeleton key={`${i}`} />
      ))}
    </div>
  );
}
