"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Share2, Copy, Check, Download, Globe } from "lucide-react"

interface ShareDialogProps {
  selectionId: string
  title: string
  isPublic: boolean
}

export function ShareDialog({ selectionId, title, isPublic: initialIsPublic }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [shareLinks, setShareLinks] = useState<{
    shareableLink: string
    pdfLink: string
  } | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generateShareLinks = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/mass-selections/${selectionId}/share`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setShareLinks(data)
        setIsPublic(true)
      }
    } catch (error) {
      console.error("Error generating share links:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLink(type)
      setTimeout(() => setCopiedLink(null), 2000)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && isPublic && !shareLinks) {
      // Generate links if selection is already public
      const baseUrl = window.location.origin
      setShareLinks({
        shareableLink: `${baseUrl}/view/${selectionId}`,
        pdfLink: `${baseUrl}/api/mass-selections/${selectionId}/pdf`,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Mass Selection</DialogTitle>
          <DialogDescription>Share "{title}" with others</DialogDescription>
        </DialogHeader>

        {!isPublic ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>This selection is currently private</span>
            </div>
            <p className="text-sm text-muted-foreground">
              To share this Mass selection, it needs to be made public. This will allow others to view and clone it.
            </p>
            <Button onClick={generateShareLinks} disabled={loading} className="w-full">
              {loading ? "Making Public..." : "Make Public & Generate Links"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="view-link">Shareable Link</Label>
              <div className="flex space-x-2">
                <Input id="view-link" value={shareLinks?.shareableLink || ""} readOnly className="flex-1" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(shareLinks?.shareableLink || "", "view")}
                >
                  {copiedLink === "view" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Others can view and clone this Mass selection</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="pdf-link">Direct PDF Download</Label>
              <div className="flex space-x-2">
                <Input id="pdf-link" value={shareLinks?.pdfLink || ""} readOnly className="flex-1" />
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(shareLinks?.pdfLink || "", "pdf")}>
                  {copiedLink === "pdf" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Direct link to download the PDF version</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>This selection is public</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.open(shareLinks?.pdfLink, "_blank")}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
