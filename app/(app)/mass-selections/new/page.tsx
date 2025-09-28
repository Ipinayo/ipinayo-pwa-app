"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Church, Heart, Users, Flower, FileText } from "lucide-react"

interface LiturgyTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  parts: string[]
}

const liturgyTemplates: LiturgyTemplate[] = [
  {
    id: "sunday-mass",
    name: "Sunday Mass",
    description: "Standard Sunday liturgy with common Mass parts",
    icon: Church,
    parts: [
      "Entrance Hymn",
      "Kyrie",
      "Gloria",
      "Responsorial Psalm",
      "Gospel Acclamation",
      "Offertory Hymn",
      "Sanctus",
      "Memorial Acclamation",
      "Great Amen",
      "Lamb of God",
      "Communion Hymn",
      "Recessional Hymn",
    ],
  },
  {
    id: "wedding",
    name: "Wedding",
    description: "Wedding ceremony with processional and recessional",
    icon: Heart,
    parts: [
      "Prelude",
      "Processional",
      "Opening Hymn",
      "Responsorial Psalm",
      "Gospel Acclamation",
      "Offertory Hymn",
      "Sanctus",
      "Memorial Acclamation",
      "Great Amen",
      "Lamb of God",
      "Communion Hymn",
      "Recessional",
    ],
  },
  {
    id: "ordination",
    name: "Ordination",
    description: "Ordination ceremony with special liturgical parts",
    icon: Users,
    parts: [
      "Entrance Hymn",
      "Kyrie",
      "Gloria",
      "Responsorial Psalm",
      "Gospel Acclamation",
      "Litany of Saints",
      "Offertory Hymn",
      "Sanctus",
      "Memorial Acclamation",
      "Great Amen",
      "Lamb of God",
      "Communion Hymn",
      "Te Deum",
      "Recessional Hymn",
    ],
  },
  {
    id: "funeral",
    name: "Funeral",
    description: "Funeral Mass with appropriate liturgical selections",
    icon: Flower,
    parts: [
      "Entrance Hymn",
      "Kyrie",
      "Responsorial Psalm",
      "Gospel Acclamation",
      "Offertory Hymn",
      "Sanctus",
      "Memorial Acclamation",
      "Great Amen",
      "Lamb of God",
      "Communion Hymn",
      "Song of Farewell",
      "Recessional Hymn",
    ],
  },
  {
    id: "blank",
    name: "Blank Template",
    description: "Start with an empty template and add your own parts",
    icon: FileText,
    parts: [],
  },
]

export default function SelectLiturgyTemplatePage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    // Navigate to creation page with template parameter
    router.push(`/mass-selections/new/create?template=${templateId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.push("/mass-selections")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Mass Selection</h1>
          <p className="text-muted-foreground mt-1">Choose a liturgy template to get started</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {liturgyTemplates.map((template) => {
          const IconComponent = template.icon
          return (
            <Card
              key={template.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50"
              onClick={() => handleTemplateSelect(template.id)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{template.name}</CardTitle>
                <CardDescription className="text-sm">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {template.parts.length > 0 ? `${template.parts.length} pre-filled parts:` : "Empty template"}
                  </p>
                  {template.parts.length > 0 && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      {template.parts.slice(0, 4).map((part, index) => (
                        <div key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-primary/30 rounded-full mr-2"></span>
                          {part}
                        </div>
                      ))}
                      {template.parts.length > 4 && (
                        <div className="flex items-center text-muted-foreground/70">
                          <span className="w-2 h-2 bg-primary/20 rounded-full mr-2"></span>+{template.parts.length - 4}{" "}
                          more parts
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  Select Template
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Don't see what you need? Start with the blank template and customize it to your requirements.
        </p>
      </div>
    </div>
  )
}
