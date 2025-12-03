"use client";

import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteDraft } from "@/lib/actions/draft";
import { toast } from "sonner";
import { useState } from "react";

interface DeleteDraftButtonProps {
  draftId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function DeleteDraftButton({
  draftId,
  variant = "outline",
  size = "default",
  className,
}: DeleteDraftButtonProps) {
  const [isDeletingDraft, setIsDeletingDraft] = useState(false);

  const handleDelete = async () => {
    setIsDeletingDraft(true);
    try {
      await deleteDraft(draftId);
    } catch (error) {
      toast.error("Error deleting selection, please try again");
    } finally {
      setIsDeletingDraft(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleDelete}
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
  );
}
