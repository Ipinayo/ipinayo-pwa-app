/**
 * Presentational types for the conversational selection assistant.
 *
 * These describe what the chat UI renders, not the wire format. When the agent
 * loop is wired in, the streaming layer will map Anthropic content blocks
 * (text / tool_use / tool_result) onto these shapes — text deltas append to
 * `content`, tool calls become `tools`, and entities the agent touches surface
 * as `entities` cards.
 */

export type AssistantRole = "user" | "assistant"

/** A draft or selection the agent created/edited/referenced, rendered as a card. */
export type EntityRef = {
  type: "draft" | "selection"
  id: string
  title: string
}

/** A single tool invocation, shown inline as a status chip while the agent works. */
export type ToolStatus = {
  id: string
  /** Human-readable summary, e.g. "Added Gloria", "Saved selection". */
  label: string
  state: "running" | "done" | "error"
}

export type AssistantMessage = {
  id: string
  role: AssistantRole
  /** Plain/markdown text. Empty while a streamed assistant turn is still arriving. */
  content: string
  /** Tool activity for an assistant turn. */
  tools?: ToolStatus[]
  /** Entity reference cards for an assistant turn. */
  entities?: EntityRef[]
  /** True while this assistant message is still streaming. */
  pending?: boolean
}
