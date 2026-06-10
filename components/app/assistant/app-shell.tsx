"use client";

import { cn } from "@/lib/utils";
import { useAssistant } from "./assistant-provider";
import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * Wraps the ENTIRE app (header, side nav, content, footer) and shifts all of it
 * left by a fixed amount when the assistant docks on large screens — so the top
 * nav reflows too, not just the page body. `children` stay server-rendered;
 * only this thin wrapper is a client component.
 *
 * The right-padding width MUST match the dock width in {@link Assistant}
 * (`w-95`/380px at lg, `33.333vw` at xl). Padding (not transform) is used so it
 * doesn't create a containing block that would break the `fixed` side nav /
 * panel.
 *
 * `data-assistant-open` (set only while the dock is actually pushing content)
 * lets descendant grids drop a column via the `assistant-open:` variant.
 */
export function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isOpen } = useAssistant();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const docked = isOpen && isDesktop === true;

  return (
    <div
      data-assistant-open={docked ? "true" : undefined}
      className={cn(
        "transition-[padding] duration-300 ease-in-out",
        isOpen && "lg:pr-95 xl:pr-[33.333vw]",
      )}
    >
      {" "}
      {children}
    </div>
  );
}
