"use client";

import { AccessPeopleList } from "./access-people-list";
import { AccessPerson } from "@/lib/collaboration-utils";
import { AddCollaborators } from "./add-collaborators";
import { AttachableGroup } from "@/types/models";
import type { CollaboratorsActions } from "./types";
import { CollaboratorsGroupBanner } from "./collaborators-group-banner";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const usingGroup = group.name !== null;

  // The one piece the children share: re-fetch the access list (and re-render
  // the server tree) after any of them mutate access.
  const refresh = async () => {
    await actions
      .list(id)
      .then(setPeople)
      .catch(() => {});
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

      <AccessPeopleList
        people={people}
        id={id}
        entityLabel={entityLabel}
        canManage={canManage}
        usingGroup={usingGroup}
        groupName={group.name}
        changeRole={actions.changeRole}
        remove={actions.remove}
        onChanged={refresh}
      />
    </div>
  );
}
