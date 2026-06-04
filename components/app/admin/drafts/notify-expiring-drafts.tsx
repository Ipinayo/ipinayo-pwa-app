"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { notifyDraftsExpiringSoon } from "@/lib/actions/admin";
import { useState } from "react";
import { withToast } from "@/lib/with-toast";

export default function NotifyExpiringDrafts() {
  const [isNotifying, setIsNotifying] = useState(false);

  const handleNotifyExpiringDrafts = async () => {
    setIsNotifying(true);
    await withToast(() => notifyDraftsExpiringSoon(), {
      success: "Users Successfully Notified About Expiring Drafts",
    });
    setIsNotifying(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={"secondary"}
          size="lg"
          className="gap-2"
          disabled={isNotifying}
        >
          {isNotifying ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              <Megaphone className="mr-2 h-4 w-4" />
              Notify Expiring Drafts
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Notify Expiring Drafts</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to notify users about drafts that are expiring
            soon?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleNotifyExpiringDrafts}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
