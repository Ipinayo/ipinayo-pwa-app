"use client";

import {
  StagedList,
  type StagedRecipient,
} from "@/components/app/collaboration/staged-list";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PersonSearch } from "@/components/common/person-search";
import { addGroupMembers } from "@/lib/actions/collaborator-groups";
import { useRouter } from "next/navigation";
import { withToast } from "@/lib/with-toast";

/** Staged multi-add: search → queue several people with roles → add all at once. */
export function AddGroupMembers({
  groupId,
  excludeIds,
}: Readonly<{
  groupId: string;
  /** Owner + existing members — never offered as candidates. */
  excludeIds: Set<string>;
}>) {
  const router = useRouter();
  const [staged, setStaged] = useState<StagedRecipient[]>([]);
  const [pending, startTransition] = useTransition();

  const stagedIds = new Set(staged.map((s) => s.user.id));
  const exclude = new Set([...excludeIds, ...stagedIds]);

  const add = () => {
    if (staged.length === 0) return;
    startTransition(async () => {
      const { data } = await withToast(
        () =>
          addGroupMembers({
            groupId,
            recipients: staged.map((s) => ({
              userId: s.user.id,
              role: s.role,
            })),
          }),
        {
          loading: "Adding…",
          success: (res) =>
            `Added ${res.added} ${res.added === 1 ? "member" : "members"}.`,
        },
      );
      if (data) {
        setStaged([]);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-3 border-b pb-3">
      <PersonSearch
        excludeIds={exclude}
        onPick={(u) =>
          setStaged((prev) => [...prev, { user: u, role: "VIEWER" }])
        }
        placeholder="Add members by name or email…"
      />

      {staged.length > 0 && (
        <div className="flex flex-col gap-1">
          <StagedList
            staged={staged}
            onRole={(userId, role) =>
              setStaged((prev) =>
                prev.map((p) => (p.user.id === userId ? { ...p, role } : p)),
              )
            }
            onRemove={(userId) =>
              setStaged((prev) => prev.filter((p) => p.user.id !== userId))
            }
          />
          <div className="flex justify-end">
            <Button onClick={add} disabled={pending} className="gap-1.5">
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                `Add ${staged.length}`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
