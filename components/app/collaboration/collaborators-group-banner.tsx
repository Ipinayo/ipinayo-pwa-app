"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Unlink, Users2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { CollaboratorsActions } from "./types";
import { ConfirmPopover } from "../../common/confirm-popover";
import Link from "next/link";
import { withToast } from "@/lib/with-toast";

/** Shown when an entity's collaborators come from a named group. Owns the
 *  detach action; the parent only re-fetches the access list via `onChanged`. */
export function CollaboratorsGroupBanner({
  entityLabel,
  groupName,
  canManage,
  id,
  detachGroup,
  onChanged,
}: Readonly<{
  entityLabel: "selection" | "draft";
  groupName: string;
  canManage: boolean;
  id: string;
  detachGroup: CollaboratorsActions["detachGroup"];
  onChanged: () => void;
}>) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const detach = () =>
    startTransition(async () => {
      const { error } = await withToast(() => detachGroup({ id }), {
        loading: "Removing group…",
        success: "Group removed.",
      });
      if (!error) {
        setOpen(false);
        onChanged();
      }
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users2 className="size-4" /> Shared via “{groupName}”
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm">
          Everyone in the group “{groupName}” can access this {entityLabel}. Add
          or remove people, or change roles, in{" "}
          <Link href="/settings/groups" className="underline">
            Settings → Groups
          </Link>
          .
        </p>
        {canManage && (
          <ConfirmPopover
            open={open}
            onOpenChange={setOpen}
            align="start"
            className="w-72"
            title="Detach the group?"
            description={`The group’s members will lose access to this ${entityLabel}. You’ll go back to adding people directly.`}
            confirmLabel="Detach group"
            pending={pending}
            onConfirm={detach}
            trigger={
              <Button variant="outline" size="sm" className="gap-1.5">
                <Unlink className="size-4" /> Stop using this group
              </Button>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
