"use server";

import { listChatSessions, loadChatMessages } from "@/db/chat";

import type { SelectionUIMessage } from "@/lib/agent/selection-agent";
import { auth } from "@/auth";

/** The signed-in user's past conversations (most recent first). */
export async function getChatSessions() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return listChatSessions(session.user.id);
}

/** Load one conversation's messages to resume it in the chat UI. */
export async function getChatMessages(
  chatId: string,
): Promise<SelectionUIMessage[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return (await loadChatMessages(chatId, session.user.id)) as SelectionUIMessage[];
}
