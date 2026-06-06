import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Create a selection for next Sunday",
  "Edit my Pentecost draft",
  "Create a selection for this week from a clone of last week",
];

export function EmptyState({
  onSuggestion,
}: Readonly<{ onSuggestion: (text: string) => void }>) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="primary-gradient flex size-14 items-center justify-center rounded-2xl">
        <Sparkles className="size-7" aria-hidden />
      </span>

      <div className="space-y-1.5">
        <h3 className="font-display text-lg">How can I help?</h3>
        <p className="text-muted-foreground text-sm">
          Tell me about your liturgical selection and I&apos;ll create it for
          you.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggestion(s)}
            className="hover:bg-muted/50 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
