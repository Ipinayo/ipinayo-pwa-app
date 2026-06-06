"use client";

import { Plus, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";
import { MessageBubble } from "./message-bubble";
import { cn } from "@/lib/utils";
import { useAssistant } from "./assistant-provider";

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
  const { messages, isStreaming, sendMessage, newConversation } = useAssistant();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const hasMessages = messages.length > 0;

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
        {hasMessages ? (
          <div className="flex flex-col gap-4 p-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        ) : (
          <EmptyState onSuggestion={sendMessage} />
        )}
      </div>

      {/* Composer */}
      <Composer onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
