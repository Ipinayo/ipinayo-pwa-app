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
      data: messages.map((m) => ({
        id: m.id,
        sessionId: chatId,
        role: m.role,
        content: m as unknown as Prisma.InputJsonValue,
      })),
    }),
  ]);
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

  return rows.map((r) => r.content as unknown as UIMessage);
}
