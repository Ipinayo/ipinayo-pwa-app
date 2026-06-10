import { cn } from "@/lib/utils";

/** The Ìpínayò AI mark. Reusable so every assistant surface shares one icon. */
export function AssistantIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <img
      src="/icons/logo.png"
      alt=""
      aria-hidden
      className={cn("object-contain", className)}
    />
  );
}
