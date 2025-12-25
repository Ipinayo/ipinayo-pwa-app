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
import { deleteDraft } from "@/lib/actions/admin";
import { useState } from "react";
import { withToast } from "@/lib/with-toast";

interface DeleteButtonProps {
  draftId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function DeleteButton({
  draftId,
  variant = "outline",
  size = "default",
  className,
}: Readonly<DeleteButtonProps>) {
  const [isDeletingDraft, setIsDeletingDraft] = useState(false);

  const handleDelete = async () => {
    setIsDeletingDraft(true);
    await withToast(() => deleteDraft(draftId), {
      success: "Successfully deleted draft!",
    });
    setIsDeletingDraft(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          disabled={isDeletingDraft}
          className={className}
          title="Delete this draft selection"
        >
          {isDeletingDraft ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-destructive" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Draft</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this draft?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
