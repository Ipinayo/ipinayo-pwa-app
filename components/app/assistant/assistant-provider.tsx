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
import { getChatMessages } from "@/lib/actions/chat";
import { useChat } from "@ai-sdk/react";

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

type AssistantContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;

  /** Whether the current visitor is signed in (the agent requires auth). */
  isAuthenticated: boolean;

  messages: SelectionUIMessage[];
  status: ChatStatus;
  /** True while a request is in flight (submitted or streaming). */
  isBusy: boolean;

  sendMessage: (text: string) => void;
  stop: () => void;
  newConversation: () => void;
  /** Resume a past conversation by id. */
  loadConversation: (chatId: string) => Promise<void>;
  /** The active conversation id. */
  chatId: string;
};

const AssistantContext = createContext<AssistantContextValue | null>(null);

export function AssistantProvider({
  children,
  isAuthenticated,
}: Readonly<{ children: React.ReactNode; isAuthenticated: boolean }>) {
  const [isOpen, setIsOpen] = useState(false);
  // The conversation id (also the server-side persistence key). Changing it
  // swaps useChat to a fresh chat keyed by that id, initialised from
  // `initialMessages` — so resuming is just "set both, together".
  const [chatId, setChatId] = useState(() => crypto.randomUUID());
  const [initialMessages, setInitialMessages] = useState<SelectionUIMessage[]>(
    [],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant",
        prepareSendMessagesRequest: ({ messages, id }) => ({
          body: { messages, chatId: id },
        }),
      }),
    [],
  );

  const { messages, sendMessage, status, stop } = useChat<SelectionUIMessage>({
    id: chatId,
    messages: initialMessages,
    transport,
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
    setInitialMessages([]);
    setChatId(crypto.randomUUID());
  }, [stop]);

  const loadConversation = useCallback(
    async (id: string) => {
      if (id === chatId) return;
      stop();
      const loaded = await getChatMessages(id);
      setInitialMessages(loaded);
      setChatId(id);
    },
    [chatId, stop],
  );

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
      loadConversation,
      chatId,
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
      loadConversation,
      chatId,
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
