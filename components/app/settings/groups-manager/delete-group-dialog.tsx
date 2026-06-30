"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteGroup } from "@/lib/actions/collaborator-groups";
import { useRouter } from "next/navigation";
import { withToast } from "@/lib/with-toast";

/** Type-to-confirm group deletion. Owns its open + typed-name state and the
 *  delete action itself. */
export function DeleteGroupDialog({
  groupId,
  groupName,
  memberCount,
  attachedCount,
}: Readonly<{
  groupId: string;
  groupName: string;
  memberCount: number;
  attachedCount: number;
}>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () =>
    startTransition(async () => {
      const { error } = await withToast(
        () => deleteGroup({ groupId, confirmName }),
        { success: "Group deleted." },
      );
      if (!error) {
        setOpen(false);
        setConfirmName("");
        router.refresh();
      }
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setConfirmName("");
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive size-8"
          aria-label="Delete group"
        >
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete “{groupName}”?</DialogTitle>
          <DialogDescription>
            This permanently deletes the group. It can’t be undone.
          </DialogDescription>
        </DialogHeader>

        <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
          <li>
            <span className="text-foreground font-medium">{memberCount}</span>{" "}
            member{memberCount === 1 ? "" : "s"} will lose access everywhere
            this group is used.
          </li>
          <li>
            <span className="text-foreground font-medium">{attachedCount}</span>{" "}
            item{attachedCount === 1 ? "" : "s"} (selections & drafts) will keep
            only you as owner — each gets a fresh, empty access list.
          </li>
          <li>The group’s members and saved roles are erased.</li>
        </ul>

        <div className="space-y-2">
          <Label htmlFor={`confirm-${groupId}`} className="text-sm">
            Type{" "}
            <span className="text-foreground font-semibold">{groupName}</span>{" "}
            to confirm
          </Label>
          <Input
            id={`confirm-${groupId}`}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            autoComplete="off"
            placeholder={groupName}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setConfirmName("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={pending || confirmName.trim() !== groupName}
            onClick={submit}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Delete group"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
