import MassSelectionListSkeleton from "@/components/app/mass-selections/mass-selection-list-skeleton";

export default function Loading() {
  return (
    <div className="max-w-full w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Liturgical Selections</h1>
          <p className="text-muted-foreground mt-2">
            Plan your liturgical music
          </p>
        </div>
      </div>

      <MassSelectionListSkeleton />
    </div>
  );
}
