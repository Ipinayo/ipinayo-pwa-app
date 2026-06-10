"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, MessageSquare, Pencil, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateFromNow } from "@/lib/utils";
import { getChatSessions } from "@/lib/actions/chat";
import { useAssistant } from "./assistant-provider";

type ChatSession = Awaited<ReturnType<typeof getChatSessions>>[number];

export function ChatHistory({
  onClose,
}: Readonly<{ onClose: () => void }>) {
  const { loadConversation, renameConversation, deleteConversation } =
    useAssistant();
  const [sessions, setSessions] = useState<ChatSession[] | null>(null);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    let active = true;
    getChatSessions().then((s) => active && setSessions(s));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!sessions) return null;
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => (s.title ?? "").toLowerCase().includes(q));
  }, [sessions, query]);

  const startEdit = (s: ChatSession) => {
    setEditingId(s.id);
    setEditValue(s.title ?? "");
  };

  const saveEdit = (id: string) => {
    const title = editValue.trim();
    setEditingId(null);
    setSessions(
      (prev) =>
        prev?.map((s) => (s.id === id ? { ...s, title: title || null } : s)) ??
        prev,
    );
    renameConversation(id, title);
  };

  const remove = (id: string) => {
    setSessions((prev) => prev?.filter((s) => s.id !== id) ?? prev);
    deleteConversation(id);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="p-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className="h-9 pl-8"
          />
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        {filtered === null ? (
          <div className="flex flex-col gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-muted/60 h-12 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm">
            <MessageSquare className="size-8 opacity-50" aria-hidden />
            {query ? "No conversations match." : "No conversations yet."}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filtered.map((s) =>
              editingId === s.id ? (
                <form
                  key={s.id}
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveEdit(s.id);
                  }}
                  className="flex items-center gap-1 px-1 py-1.5"
                >
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Conversation name"
                    className="h-8"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label="Save name"
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => setEditingId(null)}
                    aria-label="Cancel"
                  >
                    <X className="size-4" />
                  </Button>
                </form>
              ) : (
                <div
                  key={s.id}
                  className="hover:bg-muted/60 flex items-center gap-1 rounded-lg pr-1 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => {
                      loadConversation(s.id, s.title);
                      onClose();
                    }}
                    className="flex min-w-0 flex-1 flex-col items-start gap-0.5 px-3 py-2 text-left"
                  >
                    <span className="line-clamp-1 text-sm font-medium">
                      {s.title || "Untitled conversation"}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDateFromNow(s.updatedAt)}
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 hover:text-primary"
                    onClick={() => startEdit(s)}
                    aria-label="Rename conversation"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive size-8 shrink-0"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete conversation?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently removes “
                          {s.title || "Untitled conversation"}”. Drafts and
                          selections it created are not affected.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove(s.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      <p className="text-muted-foreground/70 px-4 py-2 text-center text-[11px]">
        Conversations are automatically deleted after 20 days.
      </p>
    </div>
  );
}
