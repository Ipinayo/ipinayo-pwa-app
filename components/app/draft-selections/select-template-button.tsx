"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createNewDraft } from "@/lib/actions/draft";
import { liturgyTemplates } from "@/lib/constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SelectTemplateButtonProps {
  templateId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export default function SelectTemplateButton({
  templateId,
  variant = "outline",
  size = "default",
  className,
}: SelectTemplateButtonProps) {
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const draftSelection = await createNewDraft(templateId);
      router.push(`/liturgical-selections/new/${draftSelection.id}`);
    } catch (error) {
      toast.error("Error creating selection, please try again");
    } finally {
      setIsCreating(false);
    }
  };

  const templateName = liturgyTemplates.find(
    (temp) => temp.id === templateId
  )?.name;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCreate}
      disabled={isCreating}
      className={className}
      title={`Create a selection using the ${templateName} template`}
    >
      {isCreating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>Select Template</>
      )}
    </Button>
  );
}
