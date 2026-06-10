"use client";

import { ArrowLeft, History, Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AssistantIcon } from "./assistant-icon";
import { Button } from "@/components/ui/button";
import { ChatHistory } from "./chat-history";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";
import Link from "next/link";
import { MessageBubble } from "./message-bubble";
import type { SelectionUIMessage } from "@/lib/agent/selection-agent";
import { cn } from "@/lib/utils";
import { useAssistant } from "./assistant-provider";

/** A conversation's name derived from its opening line, or undefined if empty. */
function conversationTitle(messages: SelectionUIMessage[]): string | undefined {
  const firstUser = messages.find((m) => m.role === "user");
  const text = firstUser?.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join(" ")
    .trim();
  if (!text) return undefined;
  return text.length > 32 ? `${text.slice(0, 32).trimEnd()}…` : text;
}

function Avatar() {
  return (
    <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-full">
      <AssistantIcon className="size-4" />
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <Avatar />
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

/** Default assistant turn shown to signed-out visitors, with a sign-in link. */
function WelcomeSignIn() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-2.5">
        <Avatar />
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

/** An error shown in-thread as the assistant's turn, with a Retry if recoverable. */
function ErrorBubble({
  message,
  retryable,
  onRetry,
}: Readonly<{ message: string; retryable: boolean; onRetry: () => void }>) {
  return (
    <div className="flex gap-2.5">
      <Avatar />
      <div className="flex min-w-0 flex-col items-start gap-2">
        <div className="bg-destructive/10 text-destructive w-fit max-w-[90%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm">
          {message}
        </div>
        {retryable && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={onRetry}
          >
            <RotateCcw className="size-3.5" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * While a request is in flight, keep the typing indicator up unless the
 * assistant is actively rendering text. So it stays visible through "thinking",
 * tool execution, and the lulls between steps — only the streaming-text moment
 * (where the words themselves signal progress) hides it.
 */
function isWorkingSilently(messages: SelectionUIMessage[]): boolean {
  const last = messages[messages.length - 1];
  if (last?.role !== "assistant") return true; // submitted, awaiting first output
  const lastPart = last.parts[last.parts.length - 1];
  if (!lastPart) return true;
  if (lastPart.type === "text") return lastPart.text.trim().length === 0;
  return true; // a tool call/result, reasoning, or step boundary is the tail
}

/**
 * The chat surface — header, message list (or history), composer. Shared by the
 * desktop dock and the mobile sheet; only the container differs.
 */
export function Conversation({
  onClose,
  inSheet,
}: Readonly<{ onClose?: () => void; inSheet?: boolean }>) {
  const {
    isAuthenticated,
    messages,
    isBusy,
    error,
    retry,
    sendMessage,
    newConversation,
    activeTitle,
  } = useAssistant();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (showHistory) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isBusy, error, showHistory]);

  const hasMessages = messages.length > 0;
  const awaitingReply = isBusy && isWorkingSilently(messages);
  const title = activeTitle ?? conversationTitle(messages) ?? "Ìpínayò AI";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3",
          inSheet && "pr-12",
        )}
      >
        {showHistory ? (
          <div className="flex min-w-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setShowHistory(false)}
              aria-label="Back to conversation"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <span className="font-display text-base leading-none">History</span>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar />
            <span className="font-display truncate text-base leading-none">
              {title}
            </span>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-0.5">
          {isAuthenticated && !showHistory && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setShowHistory(true)}
                aria-label="Chat history"
              >
                <History className="size-4" />
              </Button>
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
            </>
          )}
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

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {showHistory ? (
          <ChatHistory onClose={() => setShowHistory(false)} />
        ) : isAuthenticated ? (
          hasMessages ? (
            <div className="flex flex-col gap-4 p-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {awaitingReply && <TypingIndicator />}
              {error && (
                <ErrorBubble
                  message={error.message}
                  retryable={error.retryable}
                  onRetry={retry}
                />
              )}
            </div>
          ) : (
            <EmptyState onSuggestion={sendMessage} />
          )
        ) : (
          <WelcomeSignIn />
        )}
      </div>

      {/* Composer — only when signed in and not browsing history */}
      {isAuthenticated && !showHistory && (
        <Composer onSend={sendMessage} disabled={isBusy} />
      )}
    </div>
  );
}
