"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

import { Conversation } from "./conversation";
import { cn } from "@/lib/utils";
import { useAssistant } from "./assistant-provider";
import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * Renders the assistant responsively:
 * - `lg` (1024–1279): fixed 380px docked panel.
 * - `xl`+ (≥1280): one-third-width docked panel.
 *   (The whole app shifts left to make room — see {@link AppShell}.)
 * - below `lg`: a full-screen drawer. (The always-visible AI button in the top
 *   nav reopens it, so no floating launcher is needed.)
 *
 * Lives in the app layout so it stays mounted across navigation. The dock width
 * (`w-95` / `xl:w-[33.333vw]`) MUST match the content padding in AppShell
 * (`lg:pr-95` / `xl:pr-[33.333vw]`) so the page reflows in lockstep.
 */
export function Assistant() {
  const { isOpen, close } = useAssistant();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <>
      {/* Desktop: docked panel, full height, reflows the whole app. */}
      {isDesktop === true && (
        <aside
          aria-hidden={!isOpen}
          className={cn(
            "fixed inset-y-0 right-0 z-50 w-95 border-l bg-background shadow-xl transition-transform duration-300 ease-in-out xl:w-[33.333vw]",
            isOpen ? "translate-x-0" : "pointer-events-none translate-x-full",
          )}
        >
          <Conversation onClose={close} />
        </aside>
      )}

      {/* Mobile / tablet: full-screen drawer. */}
      {isDesktop === false && (
        <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-2/3">
            <SheetTitle className="sr-only">Assistant</SheetTitle>
            <Conversation inSheet />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
