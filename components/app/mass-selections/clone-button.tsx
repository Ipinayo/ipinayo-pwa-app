"use client";

import { Copy, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cloneSelection } from "@/lib/actions/mass-selections";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface CloneButtonProps {
  selectionId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export default function CloneButton({
  selectionId,
  variant = "outline",
  size = "default",
  className,
}: CloneButtonProps) {
  const [isCloning, setIsCloning] = useState(false);

  const router = useRouter();

  const { data: session } = useSession();

  const handleClone = async () => {
    setIsCloning(true);
    try {
      if (!session?.user) {
        toast.info("Please sign in to create your own selections");
        router.push("/signin");
        return;
      }
      const clonedSelection = await cloneSelection(selectionId);
      router.push(`/liturgical-selections/${clonedSelection.id}/edit`);
    } catch (error) {
      // Ignore redirect errors
      if (isRedirectError(error)) {
        return;
      }

      console.error("Error cloning selection:", error);
      toast.error("Error cloning selection, please try again");
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClone}
      disabled={isCloning}
      className={className}
      title="Create your own selection from this"
    >
      {isCloning ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          Clone
        </>
      )}
    </Button>
  );
}
