"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Music, Save, Eye } from "lucide-react"
import { liturgicalTemplates, type LiturgicalTemplate } from "@/lib/liturgical-templates"
import Image from "next/image"
import Link from "next/link"

interface MassPart {
  partName: string
  keySignature: string
  notes: string
}

export function CreateMassSelection() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    templateType: "",
    liturgicalYear: "",
    season: "",
    themes: "",
    pastoralFocus: "",
    isPublic: false,
  })

  const [selectedTemplate, setSelectedTemplate] = useState<LiturgicalTemplate | null>(null)
  const [parts, setParts] = useState<MassPart[]>([])

  const handleTemplateSelect = (templateId: string) => {
    const template = liturgicalTemplates.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      setFormData((prev) => ({
        ...prev,
        templateType: template.name,
        season: template.season || "",
      }))

      // Initialize parts from template
      const initialParts = template.parts.map((part) => ({
        partName: part.partName,
        keySignature: "",
        notes: part.description || "",
      }))
      setParts(initialParts)
    }
  }

  const handlePartChange = (index: number, field: keyof MassPart, value: string) => {
    setParts((prev) => prev.map((part, i) => (i === index ? { ...part, [field]: value } : part)))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/mass-selections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          parts,
        }),
      })

      if (response.ok) {
        const selection = await response.json()
        router.push(`/view/${selection.id}`)
      } else {
        console.error("Error creating mass selection")
      }
    } catch (error) {
      console.error("Error creating mass selection:", error)
    } finally {
      setLoading(false)
    }
  }

  const canProceedToStep2 = formData.title && formData.date && selectedTemplate
  const canSubmit = parts.length > 0 && parts.some((part) => part.partName)

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
            <h1 className="text-2xl font-display text-primary">Create Mass Selection</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              1
            </div>
            <div className={`h-px w-16 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-display text-foreground mb-2">Basic Information</h2>
              <p className="text-muted-foreground">Start by providing basic details about your Mass selection</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Mass Details</CardTitle>
                <CardDescription>Enter the basic information for your Mass selection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Mass Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Third Sunday of Advent"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="liturgicalYear">Liturgical Year</Label>
                    <Select
                      value={formData.liturgicalYear}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, liturgicalYear: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select liturgical year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Year A</SelectItem>
                        <SelectItem value="B">Year B</SelectItem>
                        <SelectItem value="C">Year C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPublic"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublic: checked }))}
                      />
                      <Label htmlFor="isPublic" className="text-sm">
                        Make this selection public
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="themes">Themes</Label>
                  <Textarea
                    id="themes"
                    placeholder="e.g., Joy, Hope, Preparation, Community"
                    value={formData.themes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, themes: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pastoralFocus">Pastoral Focus</Label>
                  <Textarea
                    id="pastoralFocus"
                    placeholder="Special considerations, homily themes, or pastoral notes"
                    value={formData.pastoralFocus}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pastoralFocus: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Choose Template</CardTitle>
                <CardDescription>
                  Select a liturgical template to get started with appropriate Mass parts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {liturgicalTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.season && (
                          <Badge variant="secondary" className="w-fit">
                            {template.season}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Music className="h-3 w-3" />
                          {template.parts.length} parts
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2}
                className="bg-primary hover:bg-primary/90"
              >
                Continue to Parts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && selectedTemplate && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-display text-foreground mb-2">Mass Parts</h2>
              <p className="text-muted-foreground">Configure the musical selections for each part of the Mass</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  {selectedTemplate.name}
                </CardTitle>
                <CardDescription>{selectedTemplate.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {parts.map((part, index) => {
                  const templatePart = selectedTemplate.parts[index]
                  return (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{part.partName}</h4>
                        {templatePart?.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>

                      {templatePart?.description && (
                        <p className="text-sm text-muted-foreground">{templatePart.description}</p>
                      )}

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`key-${index}`}>Key Signature</Label>
                          <Input
                            id={`key-${index}`}
                            placeholder="e.g., C Major, G Major"
                            value={part.keySignature}
                            onChange={(e) => handlePartChange(index, "keySignature", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`notes-${index}`}>Notes</Label>
                          <Input
                            id={`notes-${index}`}
                            placeholder="Additional notes or instructions"
                            value={part.notes}
                            onChange={(e) => handlePartChange(index, "notes", e.target.value)}
                          />
                        </div>
                      </div>

                      {templatePart?.suggestions && templatePart.suggestions.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Suggestions:</Label>
                          <div className="flex flex-wrap gap-2">
                            {templatePart.suggestions.map((suggestion, suggestionIndex) => (
                              <Badge
                                key={suggestionIndex}
                                variant="outline"
                                className="cursor-pointer hover:bg-accent"
                                onClick={() => handlePartChange(index, "notes", suggestion)}
                              >
                                {suggestion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Details
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSubmit} disabled={!canSubmit || loading}>
                  <Eye className="mr-2 h-4 w-4" />
                  Save & Preview
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Creating..." : "Create Selection"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
