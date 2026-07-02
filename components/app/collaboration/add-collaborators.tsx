"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipientList, type RecipientDraft } from "./recipient-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useTransition } from "react";

import { AttachableGroup } from "@/types/models";
import { Button } from "@/components/ui/button";
import type { CollaboratorsActions } from "./types";
import { Loader2 } from "lucide-react";
import { PersonSearch } from "../../common/person-search";
import { Textarea } from "@/components/ui/textarea";
import { withToast } from "@/lib/with-toast";

/** Direct (ad-hoc) sharing: queue people with roles + an optional message, or
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
  const [recipients, setRecipients] = useState<RecipientDraft[]>([]);
  const [message, setMessage] = useState("");
  const [groupToAttach, setGroupToAttach] = useState("");
  const [pending, startTransition] = useTransition();

  const excludeIds = new Set([
    ...existingIds,
    ...recipients.flatMap((r) => (r.userId ? [r.userId] : [])),
  ]);
  const excludeEmails = new Set(
    recipients.flatMap((r) => (r.userId ? [] : [r.email.toLowerCase()])),
  );

  const share = () => {
    if (recipients.length === 0) return;
    startTransition(async () => {
      const userRecipients = recipients.flatMap((r) =>
        r.userId ? [{ userId: r.userId, role: r.role }] : [],
      );
      const inviteRecipients = recipients.flatMap((r) =>
        r.userId ? [] : [{ email: r.email, role: r.role }],
      );
      const { data } = await withToast(
        () =>
          shareAction({
            id,
            userRecipients,
            inviteRecipients,
            message: message.trim() || undefined,
          }),
        {
          loading: "Sharing…",
          success: (res) =>
            `Shared with ${res.shared} ${res.shared === 1 ? "person" : "people"}.`,
        },
      );
      if (data) {
        setRecipients([]);
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
          excludeIds={excludeIds}
          excludeEmails={excludeEmails}
          onPick={(u) =>
            setRecipients((prev) => [
              ...prev,
              { userId: u.id, email: u.email, name: u.name, image: u.image, role: "VIEWER" },
            ])
          }
          onInvite={(email) =>
            setRecipients((prev) => [...prev, { email, role: "VIEWER" }])
          }
          emptyText="No matching users. Type a full email to invite someone new."
        />

        {recipients.length > 0 && (
          <div className="flex flex-col gap-1">
            <RecipientList
              recipients={recipients}
              onRole={(index, role) =>
                setRecipients((prev) =>
                  prev.map((r, i) => (i === index ? { ...r, role } : r)),
                )
              }
              onRemove={(index) =>
                setRecipients((prev) => prev.filter((_, i) => i !== index))
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
                  `Share with ${recipients.length}`
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
