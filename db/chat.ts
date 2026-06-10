import "server-only";

import { Prisma } from "@/lib/generated/prisma";
import type { UIMessage } from "ai";
import prisma from "@/lib/prisma";

/**
 * Persistence for assistant conversations. The session owns only the
 * conversation; the drafts/selections it touched live in the message stream
 * (tool parts). Messages are stored in the AI SDK UIMessage format so they
 * round-trip back into `useChat` on resume.
 */

/** A part that carries real content — not a bare step boundary or empty text. */
function isContentfulPart(part: UIMessage["parts"][number]): boolean {
  if (part.type === "step-start") return false;
  if (part.type === "text") return Boolean(part.text?.trim());
  return true; // tool calls, reasoning, files, etc.
}

/**
 * Drop contentless turns (e.g. an assistant message saved with empty `parts`
 * after an interrupted or failed stream). The AI SDK's `validateUIMessages`
 * rejects a message whose `parts` array is empty, which would otherwise make
 * the whole conversation un-resumable. Used on save, load, and the live
 * request path so both new and already-poisoned histories stay valid.
 */
export function dropEmptyMessages<T extends UIMessage>(messages: T[]): T[] {
  return messages.filter((m) => (m.parts ?? []).some(isContentfulPart));
}

/** Create the session if absent; reject if it exists under another user. */
export async function ensureChatSession(
  userId: string,
  chatId: string,
  title?: string | null,
) {
  const existing = await prisma.chatSession.findUnique({
    where: { id: chatId },
    select: { userId: true },
  });

  if (existing) {
    if (existing.userId !== userId) throw new Error("Forbidden");
    return;
  }

  await prisma.chatSession.create({
    data: { id: chatId, userId, title: title?.slice(0, 120) || null },
  });
}

/** Replace the session's messages with the latest full UIMessage list. */
export async function saveChatMessages(
  chatId: string,
  userId: string,
  messages: UIMessage[],
) {
  const session = await prisma.chatSession.findUnique({
    where: { id: chatId },
    select: { userId: true },
  });
  if (session?.userId !== userId) return;

  await prisma.$transaction([
    prisma.chatMessage.deleteMany({ where: { sessionId: chatId } }),
    prisma.chatMessage.createMany({
      data: dropEmptyMessages(messages).map((m) => ({
        id: m.id,
        sessionId: chatId,
        role: m.role,
        content: m as unknown as Prisma.InputJsonValue,
      })),
    }),
  ]);
}

/** List a user's conversations, most-recently-updated first; optional title search. */
export async function listChatSessions(userId: string, query?: string) {
  const sessions = await prisma.chatSession.findMany({
    where: {
      userId,
      ...(query?.trim()
        ? { title: { contains: query.trim(), mode: "insensitive" } }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, title: true, updatedAt: true },
  });
  return sessions.map((s) => ({
    id: s.id,
    title: s.title,
    updatedAt: s.updatedAt.toISOString(),
  }));
}

/** Rename a conversation (ownership-scoped). */
export async function renameChatSession(
  userId: string,
  chatId: string,
  title: string,
) {
  const trimmed = title.trim().slice(0, 120);
  await prisma.chatSession.updateMany({
    where: { id: chatId, userId },
    data: { title: trimmed || null },
  });
}

/** Delete a conversation (ownership-scoped; messages cascade). */
export async function deleteChatSession(userId: string, chatId: string) {
  await prisma.chatSession.deleteMany({ where: { id: chatId, userId } });
}

/** Purge conversations untouched for more than 20 days. Returns the count. */
export async function deleteOldChatSessions() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 20);
  const { count } = await prisma.chatSession.deleteMany({
    where: { updatedAt: { lt: cutoff } },
  });
  return count;
}

/** Load a session's messages in UIMessage format (for resuming a conversation). */
export async function loadChatMessages(
  chatId: string,
  userId: string,
): Promise<UIMessage[]> {
  const session = await prisma.chatSession.findUnique({
    where: { id: chatId },
    select: { userId: true },
  });
  if (session?.userId !== userId) return [];

  const rows = await prisma.chatMessage.findMany({
    where: { sessionId: chatId },
    orderBy: { createdAt: "asc" },
    select: { content: true },
  });

  return dropEmptyMessages(rows.map((r) => r.content as unknown as UIMessage));
}
