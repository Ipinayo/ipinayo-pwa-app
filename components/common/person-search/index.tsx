"use client";

import { Loader2, Mail, Search, UserPlus2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/common/user-avatar";
import { UserLite } from "@/types/models";
import { searchUsers } from "@/lib/actions/collaboration";
import { z } from "zod";

const isValidEmail = (email: string) => {
  return z.email().safeParse(email).success;
};

/**
 * Debounced people search with a results dropdown. Owns its own query state and
 * always searches via the shared `searchUsers` action; the parent supplies the
 * ids to exclude (already added/staged) and a pick handler.
 *
 * When `onInvite` is provided and the query is an email that matches no existing
 * user, the dropdown offers an "Invite by email" option instead — for bringing
 * someone onto the app who doesn't have an account yet.
 */
export function PersonSearch({
  excludeIds,
  excludeEmails,
  onPick,
  onInvite,
  placeholder = "Search people by name or email…",
  emptyText = "No matching users.",
}: Readonly<{
  excludeIds: Set<string>;
  excludeEmails?: Set<string>;
  onPick: (user: UserLite) => void;
  onInvite?: (email: string) => void;
  placeholder?: string;
  emptyText?: string;
}>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserLite[]>([]);
  const [searching, setSearching] = useState(false);

  const excludeRef = useRef(excludeIds);
  excludeRef.current = excludeIds;

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    setSearching(true);
    const timer = setTimeout(() => {
      searchUsers(q, Array.from(excludeRef.current))
        .then((users) => active && setResults(users))
        .catch(() => active && setResults([]))
        .finally(() => active && setSearching(false));
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const candidates = results;

  const trimmed = query.trim();
  const normalizedEmail = trimmed.toLowerCase();

  // Offer an invite when the query is an email, matches no existing user, and
  // isn't already staged.
  const canInvite = useMemo(
    () =>
      !!onInvite &&
      !searching &&
      candidates.length === 0 &&
      isValidEmail(trimmed) &&
      !excludeEmails?.has(normalizedEmail),
    [
      onInvite,
      searching,
      candidates.length,
      trimmed,
      normalizedEmail,
      excludeEmails,
    ],
  );

  const pick = useCallback(
    (user: UserLite) => {
      onPick(user);
      setQuery("");
      setResults([]);
    },
    [onPick],
  );

  const invite = useCallback(
    (email: string) => {
      onInvite?.(email.trim().toLowerCase());
      setQuery("");
      setResults([]);
    },
    [onInvite],
  );

  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
        autoComplete="off"
      />
      {trimmed.length >= 2 && (
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
                onClick={() => pick(u)}
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
                <UserPlus2 className="text-muted-foreground size-4" />
              </button>
            ))
          ) : canInvite ? (
            <button
              type="button"
              onClick={() => invite(trimmed)}
              className="hover:bg-muted flex w-full items-center gap-2 p-2 text-left"
            >
              <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full">
                <Mail className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">Invite {trimmed}</p>
                <p className="text-muted-foreground truncate text-xs">
                  Send an email invitation to join
                </p>
              </div>
              <UserPlus2 className="text-muted-foreground size-4" />
            </button>
          ) : (
            <p className="text-muted-foreground p-3 text-xs">{emptyText}</p>
          )}
        </div>
      )}
    </div>
  );
}
