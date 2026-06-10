"use client";

import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function Composer({
  onSend,
  disabled,
}: Readonly<{ onSend: (text: string) => void; disabled?: boolean }>) {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  return (
    <div className="border-t p-3">
      <div className="focus-within:border-ring focus-within:ring-ring/50 flex items-end gap-2 rounded-xl border bg-background px-3 py-2 transition-[color,box-shadow] focus-within:ring-[3px]">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={3}
          placeholder="Message the assistant…"
          className="max-h-56 min-h-18 resize-none border-0 bg-transparent p-0 leading-relaxed shadow-none focus-visible:ring-0"
        />
        <Button
          type="button"
          size="icon"
          className="size-8 shrink-0 rounded-lg"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
      <div className="my-1.5 text-center text-[11px] text-muted-foreground/70 font-extrabold">
        <p className="">Ìpínayò AI can create and edit your selections.</p>
        <p>
          Changes apply live — tap refresh in the top bar to see them on the
          page.
        </p>
      </div>
    </div>
  );
}
