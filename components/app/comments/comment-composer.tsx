"use client";

import { Bold, Italic, Loader2, Underline } from "lucide-react";
import {
  COMMENT_MAX,
  COMMENT_MIN,
  COMMENT_TOO_LONG,
  COMMENT_TOO_SHORT,
} from "@/types/schemas/comment";
import { EditorContent, useEditor } from "@tiptap/react";
import { useRef, useState } from "react";

import { AccessPerson } from "@/lib/collaboration-utils";
import { Bold as BoldMark } from "@tiptap/extension-bold";
import { Button } from "@/components/ui/button";
import { Document } from "@tiptap/extension-document";
import { History } from "@tiptap/extension-history";
import { Italic as ItalicMark } from "@tiptap/extension-italic";
import { Mention } from "@tiptap/extension-mention";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Text } from "@tiptap/extension-text";
import { Underline as UnderlineMark } from "@tiptap/extension-underline";
import UserAvatar from "@/components/common/user-avatar";
import { cn } from "@/lib/utils";

export const mentionLabel = (m: AccessPerson) =>
  m.name || m.email.split("@")[0];

/** Chip styling — identical to the rendered-comment mention highlight. */
const CHIP_CLASS = "text-primary bg-primary/10 rounded px-1 font-medium";

type Coords = { top: number; left: number };

/**
 * Comment / reply / edit composer on TipTap: bold/italic/underline + `@`
 * mentions. `@` opens a collaborator picker; a chosen mention is an atomic,
 * styled node. On submit the doc serializes to HTML (sanitized server-side) and
 * mention ids are read off the nodes. Edit mode loads the stored HTML directly.
 */
export function CommentComposer({
  mentionables,
  pending,
  submitLabel = "Comment",
  initialBody = "",
  placeholder = "Write a comment, use '@' to mention…",
  autoFocus,
  onSubmit,
  onCancel,
}: Readonly<{
  mentionables: AccessPerson[];
  pending: boolean;
  submitLabel?: string;
  initialBody?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmit: (body: string, mentionedIds: string[]) => void;
  onCancel?: () => void;
}>) {
  const [empty, setEmpty] = useState(!initialBody);
  const [error, setError] = useState<string | null>(null);
  // Bump on every transaction so the toolbar reflects the active marks.
  const [_, setForce] = useState(0);

  // Suggestion popup state, driven by the mention extension's callbacks.
  const [items, setItems] = useState<AccessPerson[]>([]);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const commandRef = useRef<
    ((attrs: { id: string; label: string }) => void) | null
  >(null);
  const itemsRef = useRef<AccessPerson[]>([]);
  const activeRef = useRef(0);

  const setActive = (i: number) => {
    activeRef.current = i;
    setActiveIndex(i);
  };

  const pick = (index: number) => {
    const m = itemsRef.current[index];
    if (m && commandRef.current) {
      commandRef.current({ id: m.id, label: mentionLabel(m) });
    }
  };

  const editor = useEditor({
    immediatelyRender: false, // required for SSR (Next)
    autofocus: autoFocus ? "end" : false,
    content: initialBody,
    editorProps: {
      attributes: {
        class:
          "tiptap border-input focus-visible:border-ring focus-visible:ring-ring/50 max-h-40 min-h-[76px] w-full overflow-auto rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]",
      },
    },
    onUpdate: ({ editor }) => {
      setEmpty(editor.isEmpty);
      setError(null);
    },
    onTransaction: () => setForce((n) => n + 1),
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
      BoldMark,
      ItalicMark,
      UnderlineMark,
      Placeholder.configure({ placeholder }),
      Mention.configure({
        HTMLAttributes: { class: CHIP_CLASS },
        renderText: ({ node }) => `@${node.attrs.label ?? node.attrs.id}`,
        deleteTriggerWithBackspace: true,
        suggestion: {
          items: ({ query }) => {
            const q = query.toLowerCase();
            return mentionables
              .filter(
                (m) =>
                  !q ||
                  m.name?.toLowerCase().includes(q) ||
                  m.email.toLowerCase().includes(q),
              )
              .slice(0, 6);
          },
          render: () => ({
            onStart: (props: any) => {
              itemsRef.current = props.items;
              commandRef.current = props.command;
              setItems(props.items);
              setActive(0);
              const rect = props.clientRect?.();
              if (rect) setCoords({ top: rect.bottom + 4, left: rect.left });
            },
            onUpdate: (props: any) => {
              itemsRef.current = props.items;
              commandRef.current = props.command;
              setItems(props.items);
              setActive(0);
              const rect = props.clientRect?.();
              if (rect) setCoords({ top: rect.bottom + 4, left: rect.left });
            },
            onKeyDown: (props: any) => {
              const list = itemsRef.current;
              if (list.length === 0) return false;
              const key = props.event.key;
              if (key === "ArrowDown") {
                setActive((activeRef.current + 1) % list.length);
                return true;
              }
              if (key === "ArrowUp") {
                setActive((activeRef.current - 1 + list.length) % list.length);
                return true;
              }
              if (key === "Enter" || key === "Tab") {
                pick(activeRef.current);
                return true;
              }
              if (key === "Escape") {
                setItems([]);
                return true;
              }
              return false;
            },
            onExit: () => {
              setItems([]);
              itemsRef.current = [];
              commandRef.current = null;
            },
          }),
        },
      }),
    ],
    // Mount-only editor; props are fixed for a composer instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  const submit = () => {
    if (!editor) return;
    const text = editor.getText({ blockSeparator: "\n" }).trim();
    if (!text) return setError("Write a comment.");
    if (text.length < COMMENT_MIN) return setError(COMMENT_TOO_SHORT);
    if (text.length > COMMENT_MAX) return setError(COMMENT_TOO_LONG);

    const ids = new Set<string>();
    editor.state.doc.descendants((node) => {
      if (node.type.name === "mention" && node.attrs.id) ids.add(node.attrs.id);
    });
    setError(null);
    onSubmit(editor.getHTML(), [...ids]);
    editor.commands.clearContent();
    setEmpty(true);
  };

  const mark = (name: "bold" | "italic" | "underline", toggle: () => void) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("size-7", editor?.isActive(name) && "bg-muted")}
      aria-pressed={editor?.isActive(name) ?? false}
      aria-label={name}
      onClick={toggle}
    >
      {name === "bold" ? (
        <Bold className="size-3.5" />
      ) : name === "italic" ? (
        <Italic className="size-3.5" />
      ) : (
        <Underline className="size-3.5" />
      )}
    </Button>
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-0.5">
        {mark("bold", () => editor?.chain().focus().toggleBold().run())}
        {mark("italic", () => editor?.chain().focus().toggleItalic().run())}
        {mark("underline", () =>
          editor?.chain().focus().toggleUnderline().run(),
        )}
      </div>

      <EditorContent editor={editor} />

      {error && <p className="text-destructive text-xs">{error}</p>}

      {items.length > 0 && coords && (
        <div
          style={{ position: "fixed", top: coords.top, left: coords.left }}
          className="bg-popover z-50 max-h-56 w-64 overflow-auto rounded-md border shadow-md"
        >
          {items.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                pick(i);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "flex w-full items-center gap-2 p-2 text-left text-sm",
                i === activeIndex ? "bg-muted" : "hover:bg-muted",
              )}
            >
              <UserAvatar user={m} className="size-6" />
              <div className="min-w-0">
                <p className="truncate font-medium">{m.name || m.email}</p>
                {m.name && (
                  <p className="text-muted-foreground truncate text-xs">
                    {m.email}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          onClick={submit}
          disabled={pending || empty}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : submitLabel}
        </Button>
      </div>
    </div>
  );
}
