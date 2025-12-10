"use client";

import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteDraft } from "@/lib/actions/draft";
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
}: DeleteButtonProps) {
  const [isDeletingDraft, setIsDeletingDraft] = useState(false);

  const handleDelete = async () => {
    setIsDeletingDraft(true);
    await withToast(() => deleteDraft(draftId), {
      success: "Successfully deleted draft!",
    });
    setIsDeletingDraft(false);
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
