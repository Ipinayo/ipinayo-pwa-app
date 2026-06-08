"use client";

import { Plus, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";
import Link from "next/link";
import { MessageBubble } from "./message-bubble";
import { cn } from "@/lib/utils";
import { useAssistant } from "./assistant-provider";

/** Default assistant turn shown to signed-out visitors, with a sign-in link. */
function WelcomeSignIn() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-2.5">
        <span className="bg-muted text-primary flex size-7 shrink-0 items-center justify-center rounded-full">
          <Sparkles className="size-3.5" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col gap-3">
          <div className="bg-muted text-foreground w-fit max-w-[90%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm">
            Hi! I&apos;m Ìpínayò&apos;s AI assistant. I can create, edit, and
            organise your liturgical selections — just describe the liturgy and
            I&apos;ll build it for you. Sign in to get started.
          </div>
          <Button asChild className="w-fit">
            <Link href="/signin">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <span className="bg-muted text-primary flex size-7 shrink-0 items-center justify-center rounded-full">
        <Sparkles className="size-3.5" aria-hidden />
      </span>
      <div className="bg-muted flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm px-4 py-3">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The chat surface itself — header, scrollable message list, composer. Shared
 * verbatim by the desktop dock and the mobile sheet; only the container differs.
 *
 * `onClose` renders a close affordance (used by the dock). In the mobile sheet
 * the Sheet provides its own close button, so it's omitted there and `inSheet`
 * reserves space so the header doesn't collide with it.
 */
export function Conversation({
  onClose,
  inSheet,
}: Readonly<{ onClose?: () => void; inSheet?: boolean }>) {
  const {
    isAuthenticated,
    messages,
    isBusy,
    status,
    sendMessage,
    newConversation,
  } = useAssistant();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isBusy]);

  const hasMessages = messages.length > 0;
  // Show a typing indicator once a request is in flight but the assistant
  // hasn't produced its message yet (last turn is still the user's).
  const awaitingReply =
    isBusy && messages[messages.length - 1]?.role === "user";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center justify-between border-b px-3",
          inSheet && "pr-12",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="bg-muted text-primary flex size-7 items-center justify-center rounded-full">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <span className="font-display text-base leading-none">Assistant</span>
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={newConversation}
            disabled={!hasMessages}
            aria-label="New conversation"
          >
            <Plus className="size-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onClose}
              aria-label="Close assistant"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isAuthenticated ? (
          hasMessages ? (
            <div className="flex flex-col gap-4 p-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {awaitingReply && <TypingIndicator />}
            </div>
          ) : (
            <EmptyState onSuggestion={sendMessage} />
          )
        ) : (
          <WelcomeSignIn />
        )}
      </div>

      {/* Composer — only when signed in */}
      {isAuthenticated && (
        <>
          <Composer onSend={sendMessage} disabled={isBusy} />
          {status === "error" && (
            <p className="text-destructive px-4 pb-2 text-xs">
              Something went wrong. Please try again.
            </p>
          )}
        </>
      )}
    </div>
  );
}
