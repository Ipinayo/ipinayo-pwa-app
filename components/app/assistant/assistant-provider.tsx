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
import { deleteChat, getChatMessages, renameChat } from "@/lib/actions/chat";

import { useChat } from "@ai-sdk/react";
import { CHAT_WARN_THRESHOLD, MAX_CHAT_MESSAGES } from "@/lib/constants";

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

  /** The last request error, if any — with whether retrying it is worthwhile. */
  error: { message: string; retryable: boolean } | null;
  /** Retry the last failed request. */
  retry: () => void;

  /** Number of messages in the active conversation. */
  messageCount: number;
  /** The hard message cap for a conversation. */
  maxMessages: number;
  /** At the cap — no more messages can be sent in this conversation. */
  atMessageLimit: boolean;
  /** Approaching the cap — nudge the user to start a new conversation. */
  nearMessageLimit: boolean;

  sendMessage: (text: string) => void;
  stop: () => void;
  newConversation: () => void;
  /** Resume a past conversation by id (and its stored title, if known). */
  loadConversation: (chatId: string, title?: string | null) => Promise<void>;
  /** Rename a conversation; keeps the active title in sync. */
  renameConversation: (chatId: string, title: string) => Promise<void>;
  /** Delete a conversation; resets to a new chat if it's the active one. */
  deleteConversation: (chatId: string) => Promise<void>;
  /** The active conversation id. */
  chatId: string;
  /** The active conversation's title, if it has one. */
  activeTitle: string | null;
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
  const [activeTitle, setActiveTitle] = useState<string | null>(null);

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

  const { messages, sendMessage, status, stop, error, regenerate } =
    useChat<SelectionUIMessage>({
      id: chatId,
      messages: initialMessages,
      transport,
    });

  // The route encodes errors as JSON `{ message, retryable }`; fall back to a
  // generic, retryable message if it's a plain (e.g. network) error.
  const parsedError = useMemo(() => {
    if (!error) return null;
    try {
      const parsed = JSON.parse(error.message) as {
        message?: string;
        retryable?: boolean;
      };
      return {
        message: parsed.message ?? "Something went wrong.",
        retryable: parsed.retryable ?? true,
      };
    } catch {
      return { message: "Something went wrong.", retryable: true };
    }
  }, [error]);

  const retry = useCallback(() => {
    void regenerate();
  }, [regenerate]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const messageCount = messages.length;
  const atMessageLimit = messageCount >= MAX_CHAT_MESSAGES;
  const nearMessageLimit =
    !atMessageLimit && messageCount >= CHAT_WARN_THRESHOLD;

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      // Guard the cap here too, so no caller can exceed it.
      if (trimmed && messages.length < MAX_CHAT_MESSAGES) {
        sendMessage({ text: trimmed });
      }
    },
    [sendMessage, messages.length],
  );

  const newConversation = useCallback(() => {
    stop();
    setInitialMessages([]);
    setActiveTitle(null);
    setChatId(crypto.randomUUID());
  }, [stop]);

  const loadConversation = useCallback(
    async (id: string, title?: string | null) => {
      if (id === chatId) return;
      stop();
      const loaded = await getChatMessages(id);
      setInitialMessages(loaded);
      setActiveTitle(title ?? null);
      setChatId(id);
    },
    [chatId, stop],
  );

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      if (id === chatId) setActiveTitle(title.trim() || null);
      await renameChat(id, title);
    },
    [chatId],
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      await deleteChat(id);
      if (id === chatId) newConversation();
    },
    [chatId, newConversation],
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
      error: parsedError,
      retry,
      messageCount,
      maxMessages: MAX_CHAT_MESSAGES,
      atMessageLimit,
      nearMessageLimit,
      sendMessage: send,
      stop,
      newConversation,
      loadConversation,
      renameConversation,
      deleteConversation,
      chatId,
      activeTitle,
    }),
    [
      isOpen,
      open,
      close,
      toggle,
      isAuthenticated,
      messages,
      status,
      parsedError,
      retry,
      messageCount,
      atMessageLimit,
      nearMessageLimit,
      send,
      stop,
      newConversation,
      loadConversation,
      renameConversation,
      deleteConversation,
      chatId,
      activeTitle,
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
