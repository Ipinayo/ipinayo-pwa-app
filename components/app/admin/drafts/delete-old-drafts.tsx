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
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteOldDrafts } from "@/lib/actions/admin";
import { useState } from "react";
import { withToast } from "@/lib/with-toast";

export default function DeleteOldDrafts() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAllOldDrafts = async () => {
    setIsDeleting(true);
    await withToast(() => deleteOldDrafts(), {
      success: "All Old Drafts Successfully deleted",
    });
    setIsDeleting(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={"outline"}
          size="lg"
          className="gap-2 text-destructive hover:text-destructive"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete all old drafts
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete all Old Drafts</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete all the drafts older than 15 days?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteAllOldDrafts}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
