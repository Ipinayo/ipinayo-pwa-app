"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Music, Copy, Edit, Globe, Lock, Loader2, User } from "lucide-react"
import { PDFDownloadButton } from "@/components/pdf-download-button"
import { ShareDialog } from "@/components/share-dialog"
import Image from "next/image"
import Link from "next/link"

interface MassPart {
  id: string
  partName: string
  keySignature?: string
  notes?: string
}

interface MassSelection {
  id: string
  title: string
  date: string
  templateType: string
  liturgicalYear?: string
  season?: string
  themes?: string
  pastoralFocus?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  createdBy: {
    name?: string
    email: string
  }
  parts: MassPart[]
}

interface ViewMassSelectionProps {
  id: string
}

export function ViewMassSelection({ id }: ViewMassSelectionProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [selection, setSelection] = useState<MassSelection | null>(null)

  useEffect(() => {
    fetchSelection()
  }, [id])

  const fetchSelection = async () => {
    try {
      const response = await fetch(`/api/mass-selections/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSelection(data)
      }
    } catch (error) {
      console.error("Error fetching selection:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClone = async () => {
    try {
      const response = await fetch(`/api/mass-selections/${id}/clone`, {
        method: "POST",
      })
      if (response.ok) {
        const clonedSelection = await response.json()
        window.location.href = `/edit/${clonedSelection.id}`
      }
    } catch (error) {
      console.error("Error cloning selection:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isOwner = selection && session?.user?.email === selection.createdBy.email

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading mass selection...</span>
        </div>
      </div>
    )
  }

  if (!selection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Mass Selection Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The mass selection you're looking for doesn't exist or is not accessible.
          </p>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <Image src="/images/logo.png" alt="ipinayo" width={120} height={40} className="h-10 w-auto" />
            <Separator orientation="vertical" className="h-8" />
            <h1 className="text-2xl font-display text-primary">Mass Selection</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Title and Actions */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-display text-foreground">{selection.title}</h2>
                {selection.isPublic ? (
                  <Badge variant="secondary">
                    <Globe className="mr-1 h-3 w-3" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Lock className="mr-1 h-3 w-3" />
                    Private
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(selection.date)}
                </div>
                <div className="flex items-center gap-1">
                  <Music className="h-4 w-4" />
                  {selection.parts.length} parts
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {selection.createdBy.name || selection.createdBy.email}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <Button variant="outline" asChild>
                  <Link href={`/edit/${id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              )}
              <Button variant="outline" onClick={handleClone}>
                <Copy className="mr-2 h-4 w-4" />
                Clone
              </Button>
              <PDFDownloadButton selectionId={id} title={selection.title} variant="outline" />
              {isOwner && <ShareDialog selectionId={id} title={selection.title} isPublic={selection.isPublic} />}
            </div>
          </div>

          {/* Mass Details */}
          <Card>
            <CardHeader>
              <CardTitle>Mass Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Template Type</Label>
                  <p className="text-sm">{selection.templateType}</p>
                </div>
                {selection.liturgicalYear && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Liturgical Year</Label>
                    <p className="text-sm">Year {selection.liturgicalYear}</p>
                  </div>
                )}
                {selection.season && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Season</Label>
                    <p className="text-sm">{selection.season}</p>
                  </div>
                )}
              </div>

              {selection.themes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Themes</Label>
                  <p className="text-sm">{selection.themes}</p>
                </div>
              )}

              {selection.pastoralFocus && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Pastoral Focus</Label>
                  <p className="text-sm">{selection.pastoralFocus}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mass Parts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Mass Parts
              </CardTitle>
              <CardDescription>Musical selections for each part of the Mass</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selection.parts.map((part, index) => (
                  <div key={part.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{part.partName}</h4>
                      {part.keySignature && (
                        <Badge variant="outline" className="text-xs">
                          {part.keySignature}
                        </Badge>
                      )}
                    </div>

                    {part.notes && <p className="text-sm text-muted-foreground">{part.notes}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Created {new Date(selection.createdAt).toLocaleDateString()}</span>
                <span>Last updated {new Date(selection.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
