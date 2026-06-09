import { SelectionUIMessage, selectionAgent } from "@/lib/agent/selection-agent";
import { createAgentUIStreamResponse, validateUIMessages } from "ai";
import { ensureChatSession, saveChatMessages } from "@/db/chat";

import { auth } from "@/auth";
import { selectionTools } from "@/lib/agent/tools";

export const maxDuration = 60;

function firstUserText(messages: SelectionUIMessage[]): string | undefined {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return undefined;
  return firstUser.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { text: string }).text)
    .join(" ")
    .trim();
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { messages, chatId } = (await req.json()) as {
    messages: SelectionUIMessage[];
    chatId?: string;
  };
  if (!chatId) return new Response("Missing chatId", { status: 400 });

  const uiMessages = (await validateUIMessages({
    messages,
    tools: selectionTools,
  })) as SelectionUIMessage[];

  await ensureChatSession(userId, chatId, firstUserText(uiMessages));

  const now = new Date();
  const today = `${
    ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
      now.getUTCDay()
    ]
  }, ${now.toISOString().slice(0, 10)}`;

  return createAgentUIStreamResponse({
    agent: selectionAgent,
    uiMessages,
    options: { today },
    originalMessages: uiMessages,
    // Stable server-side ids so persisted messages round-trip on resume.
    generateMessageId: () => `msg_${crypto.randomUUID()}`,
    onFinish: ({ messages: finalMessages }) => {
      void saveChatMessages(chatId, userId, finalMessages);
    },
  });
}
