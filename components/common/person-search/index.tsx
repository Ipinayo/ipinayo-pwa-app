"use client";

import { Loader2, Search, UserPlus2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { UserLite } from "@/types/models";
import UserAvatar from "@/components/common/user-avatar";
import { searchUsers } from "@/lib/actions/collaboration";

/**
 * Debounced people search with a results dropdown. Owns its own query state and
 * always searches via the shared `searchUsers` action; the parent supplies the
 * ids to exclude (already added/staged) and a pick handler.
 */
export function PersonSearch({
  excludeIds,
  onPick,
  placeholder = "Search people by name or email…",
  emptyText = "No matching users.",
}: Readonly<{
  excludeIds: Set<string>;
  onPick: (user: UserLite) => void;
  placeholder?: string;
  emptyText?: string;
}>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserLite[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    setSearching(true);
    const timer = setTimeout(() => {
      searchUsers(q)
        .then((users) => active && setResults(users))
        .catch(() => active && setResults([]))
        .finally(() => active && setSearching(false));
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const candidates = useMemo(
    () => results.filter((u) => !excludeIds.has(u.id)),
    [results, excludeIds],
  );

  const pick = useCallback(
    (user: UserLite) => {
      onPick(user);
      setQuery("");
      setResults([]);
    },
    [onPick],
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
          ) : (
            <p className="text-muted-foreground p-3 text-xs">{emptyText}</p>
          )}
        </div>
      )}
    </div>
  );
}
