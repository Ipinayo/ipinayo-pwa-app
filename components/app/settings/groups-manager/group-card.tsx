"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Users2 } from "lucide-react";

import { AddGroupMembers } from "./add-group-members";
import { Button } from "@/components/ui/button";
import { CollaboratorAvatar } from "@/components/app/collaboration/collaborator-avatar";
import { DeleteGroupDialog } from "./delete-group-dialog";
import { GroupMemberRow } from "./group-member-row";
import { GroupRenameForm } from "./group-rename-form";
import { GroupView } from ".";
import { useState } from "react";

export default function GroupCard({ group }: Readonly<{ group: GroupView }>) {
  const [editing, setEditing] = useState(false);

  const canEdit = group.isOwner; // rename / delete the group
  const canManageMembers = group.canManageMembers; // add / remove / change roles
  const memberIds = new Set([group.ownerId, ...group.members.map((m) => m.id)]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-lg">
          {editing ? (
            <GroupRenameForm
              groupId={group.id}
              currentName={group.name}
              onClose={() => setEditing(false)}
            />
          ) : (
            <span className="flex items-center gap-2">
              <Users2 className="size-4" /> {group.name}
            </span>
          )}

          {canEdit && !editing && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setEditing(true)}
                aria-label="Rename group"
              >
                <Pencil className="size-4" />
              </Button>
              <DeleteGroupDialog
                groupId={group.id}
                groupName={group.name}
                memberCount={group.members.length}
                attachedCount={group.attachedCount}
              />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-xs">
          Owned by{" "}
          {group.isOwner ? "you" : group.owner.name || group.owner.email} ·{" "}
          {group.members.length} member{group.members.length === 1 ? "" : "s"} ·
          used by {group.attachedCount} item
          {group.attachedCount === 1 ? "" : "s"}
        </p>

        {canManageMembers && (
          <AddGroupMembers groupId={group.id} excludeIds={memberIds} />
        )}

        {/* Owner row */}
        <div className="flex items-center gap-2 py-1">
          <CollaboratorAvatar person={group.owner} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {group.owner.name || group.owner.email}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {group.owner.email}
            </p>
          </div>
          <span className="text-muted-foreground bg-muted rounded px-2 py-1 text-xs">
            Owner
          </span>
        </div>

        {group.members.map((m) => (
          <GroupMemberRow
            key={m.id}
            groupId={group.id}
            groupName={group.name}
            member={m}
            isViewer={m.id === group.viewerId}
            canManageMembers={canManageMembers}
          />
        ))}
      </CardContent>
    </Card>
  );
}
