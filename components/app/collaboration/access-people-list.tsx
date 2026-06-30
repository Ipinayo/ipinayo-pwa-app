"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useTransition } from "react";

import type { AccessPerson } from "@/lib/collaboration-utils";
import { Button } from "@/components/ui/button";
import { CollaboratorAvatar } from "./collaborator-avatar";
import type { CollaboratorsActions } from "./types";
import { ConfirmPopover } from "../../common/confirm-popover";
import { ROLE_LABEL } from "@/lib/constants";
import { RoleSelect } from "./role-select";
import type { ShareableRole } from "@/types/schemas/collaboration";
import { withToast } from "@/lib/with-toast";

function PersonRow({
  person,
  id,
  entityLabel,
  editable,
  usingGroup,
  groupName,
  changeRole,
  remove,
  onChanged,
}: Readonly<{
  person: AccessPerson;
  id: string;
  entityLabel: "selection" | "draft";
  editable: boolean;
  usingGroup: boolean;
  groupName: string | null;
  changeRole: CollaboratorsActions["changeRole"];
  remove: CollaboratorsActions["remove"];
  onChanged: () => void;
}>) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onRole = (role: ShareableRole) =>
    startTransition(async () => {
      const { error } = await withToast(
        () => changeRole({ id, userId: person.id, role }),
        { success: "Role updated." },
      );
      if (!error) onChanged();
    });

  const onRemove = () =>
    startTransition(async () => {
      const { error } = await withToast(
        () => remove({ id, userId: person.id }),
        {
          success: "Access revoked.",
        },
      );
      setConfirmOpen(false);
      if (!error) onChanged();
    });

  return (
    <div className="flex items-center gap-2 py-1.5">
      <CollaboratorAvatar person={person} showRole />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {person.name || person.email}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {usingGroup && !person.isOwner
            ? `${person.email} · via “${groupName}”`
            : person.email}
        </p>
      </div>

      {editable ? (
        <div className="flex items-center gap-1">
          <RoleSelect
            value={person.role as ShareableRole}
            onValueChange={onRole}
            disabled={pending}
          />
          <ConfirmPopover
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Revoke access?"
            description={`${person.name || person.email} will lose access to this ${entityLabel}.`}
            confirmLabel="Revoke"
            pending={pending}
            onConfirm={onRemove}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive h-8 px-2 text-xs"
                disabled={pending}
              >
                Remove
              </Button>
            }
          />
        </div>
      ) : (
        <span className="text-muted-foreground bg-muted rounded px-2 py-1 text-xs">
          {ROLE_LABEL[person.role] ?? person.role}
        </span>
      )}
    </div>
  );
}

/** The "People with access" card: owner + collaborators (or group members). */
export function AccessPeopleList({
  people,
  id,
  entityLabel,
  canManage,
  usingGroup,
  groupName,
  changeRole,
  remove,
  onChanged,
}: Readonly<{
  people: AccessPerson[];
  id: string;
  entityLabel: "selection" | "draft";
  canManage: boolean;
  usingGroup: boolean;
  groupName: string | null;
  changeRole: CollaboratorsActions["changeRole"];
  remove: CollaboratorsActions["remove"];
  onChanged: () => void;
}>) {
  return (
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
            groupName={groupName}
            changeRole={changeRole}
            remove={remove}
            onChanged={onChanged}
          />
        ))}
      </CardContent>
    </Card>
  );
}
