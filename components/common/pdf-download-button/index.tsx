"use client";

import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { generateMassSelectionPDF } from "@/lib/pdf-generator";
import { getSelectionById } from "@/lib/actions/mass-selections";
import { toast } from "sonner";
import { useState } from "react";

interface PDFDownloadButtonProps {
  selectionId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export default function PDFDownloadButton({
  selectionId,
  variant = "outline",
  size = "default",
  className,
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const selection = await getSelectionById(selectionId);
      const pdfBytes = await generateMassSelectionPDF(selection);

      const blob = new Blob([Buffer.from(pdfBytes)], { type: "" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selection.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Unknown error downloading PDF, please try again");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          PDF
        </>
      )}
    </Button>
  );
}
