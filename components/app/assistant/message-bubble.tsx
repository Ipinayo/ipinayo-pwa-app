import { EntityRef, ToolStatus } from "@/types/assistant";

import { AssistantIcon } from "./assistant-icon";
import { EntityCard } from "./entity-card";
import { Markdown } from "./markdown";
import type { SelectionUIMessage } from "@/lib/agent/selection-agent";
import { ToolStatusChip } from "./tool-status";
import { UserMessage } from "./user-message";
import { isToolUIPart } from "ai";

/** Friendly verbs for the tool-status chips. */
const TOOL_LABELS: Record<string, string> = {
  list_templates: "Browsing templates",
  get_themes: "Checking themes",
  get_part_names: "Getting suitable part names",
  find_my_drafts: "Searching your drafts",
  find_my_selections: "Searching your selections",
  read_draft: "Reading draft",
  read_selection: "Reading selection",
  create_draft: "Creating draft",
  update_draft: "Updating draft",
  save_selection: "Saving selection",
  update_selection: "Updating selection",
  delete_draft: "Deleting draft",
  delete_selection: "Deleting selection",
  get_liturgical_day: "Checking liturgical calendar",
  find_public_selections: "Searching selections",
};

type ToolPart = Extract<
  SelectionUIMessage["parts"][number],
  { toolCallId: string }
>;

function toToolStatus(part: ToolPart): ToolStatus {
  const name = part.type.replace(/^tool-/, "");
  const label = TOOL_LABELS[name] ?? name;
  let state: ToolStatus["state"] = "running";
  if (part.state === "output-error") {
    state = "error";
  } else if (part.state === "output-available") {
    const output = part.output as { ok?: boolean } | undefined;
    state = output?.ok === false ? "error" : "done";
  }
  return { id: part.toolCallId, label, state };
}

export function MessageBubble({
  message,
}: Readonly<{ message: SelectionUIMessage }>) {
  if (message.role === "user") {
    const text = message.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("");
    return (
      <div className="flex justify-end">
        <UserMessage text={text} />
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-full">
        <AssistantIcon className="size-4" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return part.text ? (
              <div
                key={`text-${i}`}
                className="bg-muted text-foreground w-fit max-w-[90%] rounded-2xl rounded-tl-sm px-4 py-2.5"
              >
                <Markdown>{part.text}</Markdown>
              </div>
            ) : null;
          }

          if (isToolUIPart(part)) {
            const output =
              part.state === "output-available"
                ? (part.output as { entity?: EntityRef } | undefined)
                : undefined;
            if (output?.entity) {
              return (
                <EntityCard key={part.toolCallId} entity={output.entity} />
              );
            }
            return (
              <ToolStatusChip key={part.toolCallId} tool={toToolStatus(part)} />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
