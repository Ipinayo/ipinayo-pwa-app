"use client";

import { Button } from "@/components/ui/button";
import { ConfirmPopover } from "@/components/common/confirm-popover";
import { Loader2, Mail } from "lucide-react";
import type { PendingInvite } from "@/types/models";
import { ROLE_LABEL } from "@/lib/constants";
import { useState, useTransition } from "react";
import { withToast } from "@/lib/with-toast";

function InvitationRow({
  invite,
  canManage,
  revoke,
  resend,
  onRevoked,
}: Readonly<{
  invite: PendingInvite;
  canManage: boolean;
  revoke: (invitationId: string) => Promise<unknown>;
  resend?: (invitationId: string) => Promise<unknown>;
  onRevoked?: () => void;
}>) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [resending, startResend] = useTransition();

  const onRevoke = () =>
    startTransition(async () => {
      const { error } = await withToast(() => revoke(invite.id), {
        success: "Invitation revoked.",
      });
      setConfirmOpen(false);
      if (!error) onRevoked?.();
    });

  const onResend = () =>
    startResend(async () => {
      await withToast(() => resend!(invite.id), {
        loading: "Resending…",
        success: "Invitation resent.",
      });
    });

  const busy = pending || resending;

  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
        <Mail className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{invite.email}</p>
        <p className="text-muted-foreground truncate text-xs">
          Invited as {ROLE_LABEL[invite.role] ?? invite.role} · awaiting sign-in
        </p>
      </div>

      {canManage ? (
        <div className="flex items-center gap-1">
          {resend && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={onResend}
              disabled={busy}
            >
              {resending ? <Loader2 className="size-3.5 animate-spin" /> : "Resend"}
            </Button>
          )}
          <ConfirmPopover
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Revoke invitation?"
            description={`${invite.email} will no longer be able to join from their invitation email.`}
            confirmLabel="Revoke"
            pending={pending}
            onConfirm={onRevoke}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive h-8 px-2 text-xs"
                disabled={busy}
              >
                Revoke
              </Button>
            }
          />
        </div>
      ) : (
        <span className="text-muted-foreground bg-muted rounded px-2 py-1 text-xs">
          Pending
        </span>
      )}
    </div>
  );
}

/** The "Pending invitations" block: emails invited but not yet signed in. Hidden
 *  entirely when there are none. `revoke` is injected so the same list works for
 *  groups and for a selection/draft's ad-hoc group. */
export function PendingInvitesList({
  invites,
  canManage,
  revoke,
  resend,
  onRevoked,
}: Readonly<{
  invites: PendingInvite[];
  canManage: boolean;
  revoke: (invitationId: string) => Promise<unknown>;
  resend?: (invitationId: string) => Promise<unknown>;
  onRevoked?: () => void;
}>) {
  if (invites.length === 0) return null;

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-muted-foreground mt-1 text-xs font-medium">
        Pending invitations
      </p>
      {invites.map((invite) => (
        <InvitationRow
          key={invite.id}
          invite={invite}
          canManage={canManage}
          revoke={revoke}
          resend={resend}
          onRevoked={onRevoked}
        />
      ))}
    </div>
  );
}
