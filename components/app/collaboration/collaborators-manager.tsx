"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, UserPlus, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ROLE_LABEL,
  ROLE_OPTIONS,
  type AccessPersonView,
  type UserLite,
} from "./shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { CollaboratorAvatar } from "./collaborator-avatar";
import { Input } from "@/components/ui/input";
import type { ShareableRole } from "@/types/schemas/collaboration";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/common/user-avatar";
import { useRouter } from "next/navigation";
import { withToast } from "@/lib/with-toast";

type Staged = { user: UserLite; role: ShareableRole };

export type CollaboratorsActions = {
  search: (query: string) => Promise<UserLite[]>;
  share: (input: {
    id: string;
    recipients: { userId: string; role: ShareableRole }[];
    message?: string;
  }) => Promise<{ shared: number }>;
  changeRole: (input: {
    id: string;
    userId: string;
    role: ShareableRole;
  }) => Promise<void>;
  remove: (input: { id: string; userId: string }) => Promise<void>;
  list: (id: string) => Promise<AccessPersonView[]>;
};

export function CollaboratorsManager({
  entityLabel,
  id,
  canManage,
  initialPeople,
  actions,
}: Readonly<{
  entityLabel: "selection" | "draft";
  id: string;
  canManage: boolean;
  initialPeople: AccessPersonView[];
  actions: CollaboratorsActions;
}>) {
  const router = useRouter();
  const [people, setPeople] = useState<AccessPersonView[]>(initialPeople);

  // Add section
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserLite[]>([]);
  const [searching, setSearching] = useState(false);
  const [staged, setStaged] = useState<Staged[]>([]);
  const [message, setMessage] = useState("");

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = () =>
    actions
      .list(id)
      .then(setPeople)
      .catch(() => {});

  // Debounced search.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    setSearching(true);
    const timer = setTimeout(() => {
      actions
        .search(q)
        .then((users) => active && setResults(users))
        .catch(() => active && setResults([]))
        .finally(() => active && setSearching(false));
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, actions]);

  const existingIds = new Set(people.map((p) => p.id));
  const stagedIds = new Set(staged.map((s) => s.user.id));
  const candidates = results.filter(
    (u) => !existingIds.has(u.id) && !stagedIds.has(u.id),
  );

  const handleShare = () => {
    if (staged.length === 0) return;
    startTransition(async () => {
      const { data } = await withToast(
        () =>
          actions.share({
            id,
            recipients: staged.map((s) => ({
              userId: s.user.id,
              role: s.role,
            })),
            message: message.trim() || undefined,
          }),
        {
          loading: "Sharing…",
          success: (res) =>
            `Shared with ${res.shared} ${res.shared === 1 ? "person" : "people"}.`,
        },
      );
      if (data) {
        setStaged([]);
        setMessage("");
        setQuery("");
        setResults([]);
        await refresh();
        router.refresh();
      }
    });
  };

  const handleChangeRole = (userId: string, role: ShareableRole) => {
    startTransition(async () => {
      const { error } = await withToast(
        () => actions.changeRole({ id, userId, role }),
        { success: "Role updated." },
      );
      if (!error) {
        await refresh();
        router.refresh();
      }
    });
  };

  const handleRemove = (userId: string) => {
    startTransition(async () => {
      const { error } = await withToast(() => actions.remove({ id, userId }), {
        success: "Access revoked.",
      });
      setConfirmId(null);
      if (!error) {
        await refresh();
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add collaborators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people by name or email…"
                className="pl-9"
                autoComplete="off"
              />
              {query.trim().length >= 2 && (
                <div className="bg-popover absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border shadow-md">
                  {searching ? (
                    <div className="text-muted-foreground flex items-center gap-2 p-3 text-sm">
                      <Loader2 className="size-4 animate-spin" /> Searching…
                    </div>
                  ) : candidates.length > 0 ? (
                    candidates.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setStaged((prev) => [
                            ...prev,
                            { user: u, role: "VIEWER" },
                          ]);
                          setQuery("");
                          setResults([]);
                        }}
                        className="hover:bg-muted flex w-full items-center gap-2 p-2 text-left"
                      >
                        <UserAvatar user={u} className="size-7" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {u.name || u.email}
                          </p>
                          {u.name && (
                            <p className="text-muted-foreground truncate text-xs">
                              {u.email}
                            </p>
                          )}
                        </div>
                        <UserPlus className="text-muted-foreground size-4" />
                      </button>
                    ))
                  ) : (
                    <p className="text-muted-foreground p-3 text-xs">
                      No matching users. Email invites are coming soon.
                    </p>
                  )}
                </div>
              )}
            </div>

            {staged.length > 0 && (
              <div className="flex flex-col gap-1">
                {staged.map((s) => (
                  <div
                    key={s.user.id}
                    className="flex items-center gap-2 py-1.5"
                  >
                    <CollaboratorAvatar person={s.user} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {s.user.name || s.user.email}
                      </p>
                      {s.user.name && (
                        <p className="text-muted-foreground truncate text-xs">
                          {s.user.email}
                        </p>
                      )}
                    </div>
                    <Select
                      value={s.role}
                      onValueChange={(v) =>
                        setStaged((prev) =>
                          prev.map((p) =>
                            p.user.id === s.user.id
                              ? { ...p, role: v as ShareableRole }
                              : p,
                          ),
                        )
                      }
                    >
                      <SelectTrigger size="sm" className="h-8 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            <div className="flex flex-col">
                              <span>{r.label}</span>
                              <span className="text-muted-foreground text-xs">
                                {r.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() =>
                        setStaged((prev) =>
                          prev.filter((p) => p.user.id !== s.user.id),
                        )
                      }
                      aria-label="Remove recipient"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}

                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message (optional)…"
                  className="mt-1 max-h-28"
                  maxLength={500}
                />

                <div className="flex justify-end">
                  <Button
                    onClick={handleShare}
                    disabled={pending || staged.length === 0}
                    className="gap-1.5"
                  >
                    {pending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      `Share with ${staged.length}`
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">People with access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {people.map((person) => (
            <div key={person.id} className="flex items-center gap-2 py-1.5">
              <CollaboratorAvatar person={person} showRole />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {person.name || person.email}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {person.email}
                </p>
              </div>

              {person.isOwner || !canManage ? (
                <span className="text-muted-foreground bg-muted rounded px-2 py-1 text-xs">
                  {ROLE_LABEL[person.role] ?? person.role}
                </span>
              ) : (
                <div className="flex items-center gap-1">
                  <Select
                    value={person.role}
                    onValueChange={(v) =>
                      handleChangeRole(person.id, v as ShareableRole)
                    }
                    disabled={pending}
                  >
                    <SelectTrigger size="sm" className="h-8 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          <div className="flex flex-col">
                            <span>{r.label}</span>
                            <span className="text-muted-foreground text-xs">
                              {r.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Popover
                    open={confirmId === person.id}
                    onOpenChange={(o) => setConfirmId(o ? person.id : null)}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive h-8 px-2 text-xs"
                        disabled={pending}
                      >
                        Remove
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-60">
                      <p className="text-sm font-medium">Revoke access?</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {person.name || person.email} will lose access to this{" "}
                        {entityLabel}.
                      </p>
                      <div className="mt-3 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => setConfirmId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8"
                          disabled={pending}
                          onClick={() => handleRemove(person.id)}
                        >
                          {pending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            "Revoke"
                          )}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
