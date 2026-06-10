import {
  APICallError,
  createAgentUIStreamResponse,
  validateUIMessages,
} from "ai";
import { SelectionUIMessage, selectionAgent } from "@/lib/agent/selection-agent";
import {
  dropEmptyMessages,
  ensureChatSession,
  saveChatMessages,
} from "@/db/chat";

import { MAX_CHAT_MESSAGES } from "@/lib/constants";
import { auth } from "@/auth";
import { findUserParishAndChoirInfo } from "@/db/user";
import { selectionTools } from "@/lib/agent/tools";

export const maxDuration = 60;

/**
 * Classify an error into the `{ message, retryable }` payload the UI uses to
 * decide whether to offer a Retry button: transient/network/5xx failures are
 * retryable; client, auth, and validation errors are not.
 */
function errorPayload(error: unknown): { message: string; retryable: boolean } {
  let retryable = true;
  if (APICallError.isInstance(error)) {
    retryable = error.isRetryable;
  } else if (
    error instanceof Error &&
    /unauthor|forbidden|invalid|validat|not found|missing/i.test(error.message)
  ) {
    retryable = false;
  }
  return {
    message: "Something went wrong while generating a response.",
    retryable,
  };
}

/** Stream error → text sent to the client (the transport surfaces it as `error.message`). */
function describeStreamError(error: unknown): string {
  console.error("Assistant stream error:", error);
  return JSON.stringify(errorPayload(error));
}

/**
 * A non-retryable JSON error Response. The client transport throws
 * `new Error(await response.text())` on non-OK responses, so the body must be
 * the same `{ message, retryable }` shape the UI parses for stream errors.
 */
function errorResponse(
  message: string,
  status: number,
  retryable: boolean,
): Response {
  return new Response(JSON.stringify({ message, retryable }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

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
  if (!userId) return errorResponse("Please sign in to continue.", 401, false);

  try {
    // Everything up to (and including) building the stream can throw
    // synchronously: bad JSON, message validation, history conversion
    // (a corrupted/interrupted history fails convertToModelMessages inside
    // createAgentUIStreamResponse), or DB. Catch it all here so the client
    // gets the same parseable error payload as a mid-stream failure rather
    // than a bare 500. Errors *during* streaming are handled by onError.
    const body = (await req.json()) as {
      messages: SelectionUIMessage[];
      chatId?: string;
    };
    const chatId = body.chatId;
    if (!chatId) return errorResponse("Missing chatId.", 400, false);

    // Strip any contentless turn the live client may hold (e.g. an assistant
    // placeholder left by a failed stream) so validation doesn't reject it.
    const uiMessages = (await validateUIMessages({
      messages: dropEmptyMessages(body.messages ?? []),
      tools: selectionTools,
    })) as SelectionUIMessage[];

    // Bound conversation length (cost + latency). The client blocks at the cap
    // too; this is the server-side backstop.
    if (uiMessages.length > MAX_CHAT_MESSAGES) {
      return errorResponse(
        "This conversation has reached its message limit. Start a new conversation to continue.",
        400,
        false,
      );
    }

    const [, profile] = await Promise.all([
      ensureChatSession(userId, chatId, firstUserText(uiMessages)),
      findUserParishAndChoirInfo(userId),
    ]);

    const now = new Date();
    const today = `${[
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][now.getUTCDay()]
      }, ${now.toISOString().slice(0, 10)}`;

    return await createAgentUIStreamResponse({
      agent: selectionAgent,
      uiMessages,
      options: {
        today,
        parishName: profile?.parishName ?? null,
        choirName: profile?.choirName ?? null,
      },
      originalMessages: uiMessages,
      // Stable server-side ids so persisted messages round-trip on resume.
      generateMessageId: () => `msg_${crypto.randomUUID()}`,
      onError: describeStreamError,
      onFinish: ({ messages: finalMessages }) => {
        void saveChatMessages(chatId, userId, finalMessages);
      },
    });
  } catch (error) {
    console.error("Assistant request failed:", error);
    const { message, retryable } = errorPayload(error);
    return errorResponse(message, 500, retryable);
  }
}
