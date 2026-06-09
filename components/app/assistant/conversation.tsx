"use client";

import { ArrowLeft, History, MessageSquare, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AssistantIcon } from "./assistant-icon";
import { Button } from "@/components/ui/button";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";
import Link from "next/link";
import { MessageBubble } from "./message-bubble";
import type { SelectionUIMessage } from "@/lib/agent/selection-agent";
import { cn, formatDateFromNow } from "@/lib/utils";

import { getChatSessions } from "@/lib/actions/chat";
import { useAssistant } from "./assistant-provider";

/** Title for the panel: the conversation's opening line, else the product name. */
function conversationTitle(messages: SelectionUIMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  const text = firstUser?.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join(" ")
    .trim();
  if (!text) return "Ìpínayò AI";
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

function ChatHistory({
  onSelect,
}: Readonly<{ onSelect: (id: string) => void }>) {
  const [sessions, setSessions] = useState<
    Awaited<ReturnType<typeof getChatSessions>> | null
  >(null);

  useEffect(() => {
    let active = true;
    getChatSessions().then((s) => active && setSessions(s));
    return () => {
      active = false;
    };
  }, []);

  if (sessions === null) {
    return (
      <div className="flex flex-col gap-1 p-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-muted/60 h-12 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm">
        <MessageSquare className="size-8 opacity-50" aria-hidden />
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 p-2">
      {sessions.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s.id)}
          className="hover:bg-muted/60 flex flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-colors"
        >
          <span className="line-clamp-1 text-sm font-medium">
            {s.title || "Untitled conversation"}
          </span>
          <span className="text-muted-foreground text-xs">
            {formatDateFromNow(s.updatedAt)}
          </span>
        </button>
      ))}
    </div>
  );
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
    status,
    sendMessage,
    newConversation,
    loadConversation,
  } = useAssistant();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (showHistory) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isBusy, showHistory]);

  const hasMessages = messages.length > 0;
  const awaitingReply =
    isBusy && messages[messages.length - 1]?.role === "user";
  const title = conversationTitle(messages);

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
          <ChatHistory
            onSelect={(id) => {
              void loadConversation(id);
              setShowHistory(false);
            }}
          />
        ) : isAuthenticated ? (
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

      {/* Composer — only when signed in and not browsing history */}
      {isAuthenticated && !showHistory && (
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
