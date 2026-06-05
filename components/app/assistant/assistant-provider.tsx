"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { AssistantMessage } from "@/types/assistant";

type AssistantContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;

  messages: AssistantMessage[];
  isStreaming: boolean;

  /** Send a user turn. UI-only for now — wiring to the agent loop comes later. */
  sendMessage: (text: string) => void;
  /** Clear the thread and start fresh. */
  newConversation: () => void;
};

const AssistantContext = createContext<AssistantContextValue | null>(null);

/**
 * Seeded example thread so the panel has something to show while we build the
 * UI. Static ids/timestamps avoid hydration mismatches. Remove once the agent
 * loop is wired in.
 */
const SEED_MESSAGES: AssistantMessage[] = [
  {
    id: "seed-1",
    role: "user",
    content: "Create a selection for Pentecost Sunday this year.",
  },
  {
    id: "seed-2",
    role: "assistant",
    content:
      "Let's build it. I've started a draft titled \"Pentecost Sunday\" with the usual parts. What's your entrance hymn?",
    tools: [
      { id: "seed-2-t1", label: "Created draft", state: "done" },
      { id: "seed-2-t2", label: "Added 6 parts", state: "done" },
    ],
    entities: [{ type: "draft", id: "demo-draft", title: "Pentecost Sunday" }],
  },
];

export function AssistantProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>(SEED_MESSAGES);
  const [isStreaming, setIsStreaming] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const newConversation = useCallback(() => {
    setMessages([]);
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Optimistically append the user's turn.
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: trimmed },
    ]);

    // TODO(agent): replace this placeholder with the SSE agent loop. For now we
    // echo a static assistant turn so the chat surface is fully visible.
    const replyId = crypto.randomUUID();
    setIsStreaming(true);
    setMessages((prev) => [
      ...prev,
      { id: replyId, role: "assistant", content: "", pending: true },
    ]);

    globalThis.window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === replyId
            ? {
                ...m,
                pending: false,
                content:
                  "The assistant backend isn't connected yet — this is the UI preview. Once wired, I'll gather the details and create your selection here.",
              }
            : m,
        ),
      );
      setIsStreaming(false);
    }, 700);
  }, []);

  const value = useMemo<AssistantContextValue>(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      messages,
      isStreaming,
      sendMessage,
      newConversation,
    }),
    [
      isOpen,
      open,
      close,
      toggle,
      messages,
      isStreaming,
      sendMessage,
      newConversation,
    ],
  );

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error("useAssistant must be used within an AssistantProvider");
  }
  return ctx;
}
