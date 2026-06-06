import { AssistantMessage } from "@/types/assistant";
import { EntityCard } from "./entity-card";
import { Sparkles } from "lucide-react";
import { ToolStatusChip } from "./tool-status";
import { cn } from "@/lib/utils";

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Assistant is typing">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

export function MessageBubble({ message }: Readonly<{ message: AssistantMessage }>) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="primary-gradient max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <span className="bg-muted text-primary flex size-7 shrink-0 items-center justify-center rounded-full">
        <Sparkles className="size-3.5" aria-hidden />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {message.content ? (
          <div className="bg-muted text-foreground w-fit max-w-[90%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : message.pending ? (
          <div className="bg-muted w-fit rounded-2xl rounded-tl-sm px-4 py-1.5">
            <TypingDots />
          </div>
        ) : null}

        {message.tools && message.tools.length > 0 && (
          <div className={cn("flex flex-wrap gap-1.5", message.content && "pl-1")}>
            {message.tools.map((tool) => (
              <ToolStatusChip key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {message.entities && message.entities.length > 0 && (
          <div className="flex flex-col gap-2">
            {message.entities.map((entity) => (
              <EntityCard key={`${entity.type}-${entity.id}`} entity={entity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
