"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StagedList, type StagedRecipient } from "./staged-list";
import { useState, useTransition } from "react";

import type { CollaboratorsActions } from "./types";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PersonSearch } from "../../common/person-search";
import { Textarea } from "@/components/ui/textarea";
import { withToast } from "@/lib/with-toast";
import { AttachableGroup } from "@/types/models";

/** Direct (ad-hoc) sharing: stage people with roles + an optional message, or
 *  switch to a saved group. Owns the share + attach actions. */
export function AddCollaborators({
  id,
  existingIds,
  attachableGroups,
  share: shareAction,
  attachGroup,
  onChanged,
}: Readonly<{
  id: string;
  existingIds: Set<string>;
  attachableGroups: AttachableGroup[];
  share: CollaboratorsActions["share"];
  attachGroup: CollaboratorsActions["attachGroup"];
  onChanged: () => void;
}>) {
  const [staged, setStaged] = useState<StagedRecipient[]>([]);
  const [message, setMessage] = useState("");
  const [groupToAttach, setGroupToAttach] = useState("");
  const [pending, startTransition] = useTransition();

  const stagedIds = new Set(staged.map((s) => s.user.id));
  const exclude = new Set([...existingIds, ...stagedIds]);

  const share = () => {
    if (staged.length === 0) return;
    startTransition(async () => {
      const { data } = await withToast(
        () =>
          shareAction({
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
        onChanged();
      }
    });
  };

  const attach = () => {
    if (!groupToAttach) return;
    startTransition(async () => {
      const { error } = await withToast(
        () => attachGroup({ id, groupId: groupToAttach }),
        { loading: "Applying group…", success: "Group applied." },
      );
      if (!error) {
        setGroupToAttach("");
        onChanged();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add collaborators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <PersonSearch
          excludeIds={exclude}
          onPick={(u) =>
            setStaged((prev) => [...prev, { user: u, role: "VIEWER" }])
          }
          emptyText="No matching users. Email invites are coming soon."
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

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message (optional)…"
              className="mt-1 max-h-28"
              maxLength={500}
            />

            <div className="flex justify-end">
              <Button onClick={share} disabled={pending} className="gap-1.5">
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  `Share with ${staged.length}`
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Switch to a saved group instead of adding people one by one. */}
        {attachableGroups.length > 0 && (
          <div className="flex flex-col gap-2 border-t pt-3">
            <p className="text-muted-foreground text-xs">
              Or use a saved collaborator group:
            </p>
            <div className="flex items-center gap-2">
              <Select value={groupToAttach} onValueChange={setGroupToAttach}>
                <SelectTrigger size="sm" className="h-8 flex-1 text-xs">
                  <SelectValue placeholder="Choose a group…" />
                </SelectTrigger>
                <SelectContent>
                  {attachableGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name} ({g.memberCount}{" "}
                      {g.memberCount === 1 ? "member" : "members"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                disabled={pending || !groupToAttach}
                onClick={attach}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
