"use client";

import {
  RecipientList,
  type RecipientDraft,
} from "@/components/app/collaboration/recipient-list";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PersonSearch } from "@/components/common/person-search";
import { addGroupMembers } from "@/lib/actions/collaborator-groups";
import { useRouter } from "next/navigation";
import { withToast } from "@/lib/with-toast";

/** Outcome summary for the toast, e.g. "Added 2 members and invited 1 by email." */
function summarize(added: number, invited: number) {
  const parts: string[] = [];
  if (added > 0)
    parts.push(`added ${added} ${added === 1 ? "member" : "members"}`);
  if (invited > 0) parts.push(`invited ${invited} by email`);
  const text = parts.join(" and ") || "no changes made";
  return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

/** Queue several people (or email invites) with roles, then add them all at once. */
export function AddGroupMembers({
  groupId,
  excludeIds,
}: Readonly<{
  groupId: string;
  /** Owner + existing members — never offered as candidates. */
  excludeIds: Set<string>;
}>) {
  const router = useRouter();
  const [recipients, setRecipients] = useState<RecipientDraft[]>([]);
  const [pending, startTransition] = useTransition();

  const excludeUserIds = new Set([
    ...excludeIds,
    ...recipients.flatMap((r) => (r.userId ? [r.userId] : [])),
  ]);
  const excludeEmails = new Set(
    recipients.flatMap((r) => (r.userId ? [] : [r.email.toLowerCase()])),
  );

  const add = () => {
    if (recipients.length === 0) return;
    startTransition(async () => {
      const userRecipients = recipients.flatMap((r) =>
        r.userId ? [{ userId: r.userId, role: r.role }] : [],
      );
      const inviteRecipients = recipients.flatMap((r) =>
        r.userId ? [] : [{ email: r.email, role: r.role }],
      );
      const { data } = await withToast(
        () => addGroupMembers({ groupId, userRecipients, inviteRecipients }),
        {
          loading: "Adding…",
          success: (res) => summarize(res.added, res.invited),
        },
      );
      if (data) {
        setRecipients([]);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-3 border-b pb-3">
      <PersonSearch
        excludeIds={excludeUserIds}
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
        placeholder="Add members by name or email…"
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
          <div className="flex justify-end">
            <Button onClick={add} disabled={pending} className="gap-1.5">
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                `Add ${recipients.length}`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
