"use client";

import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteSelection } from "@/lib/actions/mass-selections";
import { useState } from "react";
import { withToast } from "@/lib/with-toast";

interface DeleteButtonProps {
  selectionId: string;
  onSuccess?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export default function DeleteButton({
  selectionId,
  onSuccess,
  variant = "outline",
  size = "default",
  className,
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this mass selection?"))
      return;

    setIsDeleting(true);
    await withToast(() => deleteSelection(selectionId), {
      success: () => {
        onSuccess?.();
        return "Successfully deleted!";
      },
    });
    setIsDeleting(false);
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleDelete}
      disabled={isDeleting}
      className={className}
    >
      {isDeleting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <>
          <Trash2 className="mr-2 h-4 w-4 text-destructive" />
          Delete
        </>
      )}
    </Button>
  );
}
