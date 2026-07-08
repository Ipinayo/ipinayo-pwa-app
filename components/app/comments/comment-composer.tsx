"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useMemo, useRef, useState } from "react";

import { AccessPerson } from "@/lib/collaboration-utils";
import { Button } from "@/components/ui/button";
import { Document } from "@tiptap/extension-document";
import { History } from "@tiptap/extension-history";
import { Loader2 } from "lucide-react";
import { Mention } from "@tiptap/extension-mention";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Text } from "@tiptap/extension-text";
import UserAvatar from "@/components/common/user-avatar";
import { cn } from "@/lib/utils";

export const mentionLabel = (m: AccessPerson) => m.name || m.email.split("@")[0];

/** Chip styling — identical to the rendered-comment mention highlight. */
const CHIP_CLASS = "text-primary bg-primary/10 rounded px-1 font-medium";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeRegExp = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

/** Build TipTap-parseable HTML from a stored `@Label` body (for edit mode) —
 *  mentions become `<span data-type="mention">` nodes, the rest stays text. */
function bodyToHtml(body: string, mentionables: AccessPerson[]) {
  const labels = mentionables
    .map((m) => ({ id: m.id, label: mentionLabel(m) }))
    .filter((l) => l.label)
    .sort((a, b) => b.label.length - a.label.length);
  if (!body) return "";
  if (labels.length === 0) return `<p>${escapeHtml(body)}</p>`;

  const byLabel = new Map(labels.map((l) => [l.label, l.id]));
  const pattern = new RegExp(
    `@(?:${labels.map((l) => escapeRegExp(l.label)).join("|")})`,
    "g",
  );
  let html = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(body)) !== null) {
    if (m.index > last) html += escapeHtml(body.slice(last, m.index));
    const label = m[0].slice(1);
    const id = byLabel.get(label);
    html += id
      ? `<span data-type="mention" data-id="${id}" data-label="${escapeHtml(label)}"></span>`
      : escapeHtml(m[0]);
    last = m.index + m[0].length;
  }
  if (last < body.length) html += escapeHtml(body.slice(last));
  return `<p>${html}</p>`;
}

type Coords = { top: number; left: number };

/**
 * Comment / reply / edit composer on TipTap. Typing `@` opens a collaborator
 * picker; a chosen mention is an atomic, styled node (one Backspace removes it).
 * On submit the doc serializes to plain text (`@Label`) with mention ids read
 * off the mention nodes — the server contract is unchanged.
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

  // Suggestion popup state, driven by the mention extension's callbacks.
  const [items, setItems] = useState<AccessPerson[]>([]);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Refs the (once-created) suggestion handlers read without stale closures.
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

  const initialContent = useMemo(
    () => bodyToHtml(initialBody, mentionables),
    // Mount-only: a composer instance has a fixed initialBody.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const editor = useEditor({
    immediatelyRender: false, // required for SSR (Next)
    autofocus: autoFocus ? "end" : false,
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "tiptap border-input focus-visible:border-ring focus-visible:ring-ring/50 max-h-40 min-h-[76px] w-full overflow-auto rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]",
      },
    },
    onUpdate: ({ editor }) => setEmpty(editor.isEmpty),
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
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
    if (!editor || editor.isEmpty) return;
    const text = editor.getText({ blockSeparator: "\n" }).trim();
    if (!text) return;
    const ids = new Set<string>();
    editor.state.doc.descendants((node) => {
      if (node.type.name === "mention" && node.attrs.id) ids.add(node.attrs.id);
    });
    onSubmit(text, [...ids]);
    editor.commands.clearContent();
    setEmpty(true);
  };

  return (
    <div className="space-y-2">
      <EditorContent editor={editor} />

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
