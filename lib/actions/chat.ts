"use server";

import {
  deleteChatSession,
  listChatSessions,
  loadChatMessages,
  renameChatSession,
} from "@/db/chat";

import type { SelectionUIMessage } from "@/lib/agent/selection-agent";
import { auth } from "@/auth";

/** The signed-in user's past conversations (most recent first), optional search. */
export async function getChatSessions(query?: string) {
  const session = await auth();
  if (!session?.user?.id) return [];
  return listChatSessions(session.user.id, query);
}

/** Rename one of the user's conversations. */
export async function renameChat(chatId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await renameChatSession(session.user.id, chatId, title);
}

/** Delete one of the user's conversations. */
export async function deleteChat(chatId: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await deleteChatSession(session.user.id, chatId);
}

/** Load one conversation's messages to resume it in the chat UI. */
export async function getChatMessages(
  chatId: string,
): Promise<SelectionUIMessage[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return (await loadChatMessages(chatId, session.user.id)) as SelectionUIMessage[];
}
