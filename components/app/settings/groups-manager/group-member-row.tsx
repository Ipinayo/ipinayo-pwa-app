"use client";

import {
  changeGroupMemberRole,
  removeGroupMember,
} from "@/lib/actions/collaborator-groups";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { CollaboratorAvatar } from "@/components/app/collaboration/collaborator-avatar";
import { ConfirmPopover } from "@/components/common/confirm-popover";
import { ROLE_LABEL } from "@/lib/constants";
import { RoleSelect } from "@/components/app/collaboration/role-select";
import type { ShareableRole } from "@/types/schemas/collaboration";
import { UserLite } from "@/types/models";
import { useRouter } from "next/navigation";
import { withToast } from "@/lib/with-toast";

type Member = UserLite & { role: ShareableRole };

export function GroupMemberRow({
  groupId,
  groupName,
  member,
  isViewer,
  canManageMembers,
}: Readonly<{
  groupId: string;
  groupName: string;
  member: Member;
  isViewer: boolean;
  canManageMembers: boolean;
}>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const changeRole = (role: ShareableRole) =>
    startTransition(async () => {
      const { error } = await withToast(
        () => changeGroupMemberRole({ groupId, userId: member.id, role }),
        { success: "Role updated." },
      );
      if (!error) router.refresh();
    });

  const remove = () =>
    startTransition(async () => {
      const { error } = await withToast(
        () => removeGroupMember({ groupId, userId: member.id }),
        { success: "Member removed." },
      );
      setConfirmOpen(false);
      if (!error) router.refresh();
    });

  const leave = () =>
    startTransition(async () => {
      const { error } = await withToast(
        () => removeGroupMember({ groupId, userId: member.id }),
        { success: `You left “${groupName}”.` },
      );
      setConfirmOpen(false);
      if (!error) router.refresh();
    });

  return (
    <div className="flex items-center gap-2 py-1">
      <CollaboratorAvatar person={member} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {member.name || member.email}
          {isViewer && (
            <span className="text-muted-foreground font-normal"> (You)</span>
          )}
        </p>
        <p className="text-muted-foreground truncate text-xs">{member.email}</p>
      </div>

      {canManageMembers ? (
        <div className="flex items-center gap-1">
          <RoleSelect
            value={member.role}
            onValueChange={changeRole}
            disabled={pending}
          />
          <ConfirmPopover
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Remove member?"
            description={`${member.name || member.email} will lose access everywhere this group is used.`}
            confirmLabel="Remove"
            pending={pending}
            onConfirm={remove}
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
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground bg-muted rounded px-2 py-1 text-xs">
            {ROLE_LABEL[member.role] ?? member.role}
          </span>
          {isViewer && (
            <ConfirmPopover
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Leave this group?"
              description={`You’ll lose access everywhere “${groupName}” is used.`}
              confirmLabel="Leave"
              pending={pending}
              onConfirm={leave}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive h-8 px-2 text-xs"
                  disabled={pending}
                >
                  Leave
                </Button>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
