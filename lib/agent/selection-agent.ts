import "server-only";

import { InferAgentUIMessage, ToolLoopAgent, stepCountIs } from "ai";

import { SELECTION_AGENT_INSTRUCTIONS } from "./instructions";
import { selectionTools } from "./tools";
import { z } from "zod";

/**
 * The Ìpínayò selection assistant. Runs through the Vercel AI Gateway
 * (AI_GATEWAY_API_KEY) on given model (AI_GATEWAY_MODEL). Created once at module scope and
 * reused by the route handler.
 */
export const selectionAgent = new ToolLoopAgent({
  model: process.env.AI_GATEWAY_MODEL || "anthropic/claude-haiku-4.5",
  instructions: SELECTION_AGENT_INSTRUCTIONS,
  tools: selectionTools,
  stopWhen: stepCountIs(16),
  // Per-request context: today's date so the agent can resolve "next Sunday" etc.
  callOptionsSchema: z.object({ today: z.string() }),
  prepareCall: ({ options, ...settings }) => ({
    ...settings,
    instructions: `${SELECTION_AGENT_INSTRUCTIONS}\n\nToday is ${options.today}.`,
  }),
});

/** End-to-end-typed UI message for this agent — import as a type on the client. */
export type SelectionUIMessage = InferAgentUIMessage<typeof selectionAgent>;
