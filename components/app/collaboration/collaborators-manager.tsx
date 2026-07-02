"use client";

import { AttachableGroup, PendingInvite } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

import { AccessPerson } from "@/lib/collaboration-utils";
import { AddCollaborators } from "./add-collaborators";
import type { CollaboratorsActions } from "./types";
import { CollaboratorsGroupBanner } from "./collaborators-group-banner";
import { PendingInvitesList } from "./pending-invites-list";
import PersonRow from "./person-row";
import { useRouter } from "next/navigation";

export function CollaboratorsManager({
  entityLabel,
  id,
  canManage,
  initialPeople,
  group,
  attachableGroups = [],
  actions,
}: Readonly<{
  entityLabel: "selection" | "draft";
  id: string;
  canManage: boolean;
  initialPeople: AccessPerson[];
  /** The entity's group. `name === null` means ad-hoc (direct sharing). */
  group: { id: string; name: string | null };
  attachableGroups?: AttachableGroup[];
  actions: CollaboratorsActions;
}>) {
  const router = useRouter();
  const [people, setPeople] = useState<AccessPerson[]>(initialPeople);
  const [invites, setInvites] = useState<PendingInvite[]>([]);

  const usingGroup = group.name !== null;

  // Pending invites only exist on the ad-hoc (direct-sharing) path; when a named
  // group is attached, its invites are managed in the group's settings instead.
  useEffect(() => {
    if (usingGroup || !canManage) return;
    actions
      .listInvites(id)
      .then(setInvites)
      .catch(() => {});
  }, [id, usingGroup, canManage, actions]);

  // The one piece the children share: re-fetch the access list + pending invites
  // (and re-render the server tree) after any of them mutate access.
  const refresh = async () => {
    await Promise.all([
      actions
        .list(id)
        .then(setPeople)
        .catch(() => {}),
      usingGroup || !canManage
        ? Promise.resolve()
        : actions
            .listInvites(id)
            .then(setInvites)
            .catch(() => {}),
    ]);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {usingGroup && (
        <CollaboratorsGroupBanner
          entityLabel={entityLabel}
          groupName={group.name!}
          canManage={canManage}
          id={id}
          detachGroup={actions.detachGroup}
          onChanged={refresh}
        />
      )}

      {canManage && !usingGroup && (
        <AddCollaborators
          id={id}
          existingIds={new Set(people.map((p) => p.id))}
          attachableGroups={attachableGroups}
          share={actions.share}
          attachGroup={actions.attachGroup}
          onChanged={refresh}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">People with access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {people.map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              id={id}
              entityLabel={entityLabel}
              editable={canManage && !person.isOwner && !usingGroup}
              usingGroup={usingGroup}
              groupName={group.name}
              changeRole={actions.changeRole}
              remove={actions.remove}
              onChanged={refresh}
            />
          ))}
          {!usingGroup && (
            <PendingInvitesList
              invites={invites}
              canManage={canManage}
              revoke={(invitationId) =>
                actions.revokeInvite({ id, invitationId })
              }
              resend={(invitationId) =>
                actions.resendInvite({ id, invitationId })
              }
              onRevoked={refresh}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
