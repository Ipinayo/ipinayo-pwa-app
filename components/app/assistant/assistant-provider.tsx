"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { DefaultChatTransport } from "ai";
import type { SelectionUIMessage } from "@/lib/agent/selection-agent";
import { useChat } from "@ai-sdk/react";

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

type AssistantContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;

  isAuthenticated: boolean;

  messages: SelectionUIMessage[];
  status: ChatStatus;
  isBusy: boolean;

  sendMessage: (text: string) => void;
  stop: () => void;
  newConversation: () => void;
};

const AssistantContext = createContext<AssistantContextValue | null>(null);

export function AssistantProvider({
  children,
  isAuthenticated,
}: Readonly<{ children: React.ReactNode; isAuthenticated: boolean }>) {
  const [isOpen, setIsOpen] = useState(false);
  // One conversation id per chat session; persisted server-side under this id.
  const [chatId, setChatId] = useState(() => crypto.randomUUID());

  const { messages, sendMessage, status, stop, setMessages } =
    useChat<SelectionUIMessage>({
      id: chatId,
      transport: new DefaultChatTransport({
        api: "/api/assistant",
        // Server keys persistence on chatId.
        prepareSendMessagesRequest: ({ messages, id }) => ({
          body: { messages, chatId: id },
        }),
      }),
    });

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (trimmed) sendMessage({ text: trimmed });
    },
    [sendMessage],
  );

  const newConversation = useCallback(() => {
    stop();
    setMessages([]);
    setChatId(crypto.randomUUID());
  }, [stop, setMessages]);

  const value = useMemo<AssistantContextValue>(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      isAuthenticated,
      messages,
      status: status as ChatStatus,
      isBusy: status === "submitted" || status === "streaming",
      sendMessage: send,
      stop,
      newConversation,
    }),
    [
      isOpen,
      open,
      close,
      toggle,
      isAuthenticated,
      messages,
      status,
      send,
      stop,
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
