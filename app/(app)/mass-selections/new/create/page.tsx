"use client";

import { ArrowLeft, Eye, Plus, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LiturgicalSeason,
  MassPart,
  NewMassSelection,
  NewMassSelectionPart,
} from "@/types/models";
import MultipleSelector, {
  Option,
} from "@/components/common/multiple-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  liturgicalSeasonItems,
  liturgicalYearItems,
  templateParts,
} from "@/lib/constants";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LiturgicalYear } from "../../../../../lib/generated/prisma/index";
import { MassPartRow } from "@/components/common/mass-part-row";
import { Switch } from "@/components/ui/switch";
import { getEnum } from "@/lib/utils";

const seasons = [{ label: "", value: "" }, ...liturgicalSeasonItems];
const years = [{ label: "", value: "" }, ...liturgicalYearItems];

export default function CreateMassSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const template = searchParams.get("template") || "blank";

  const [themes, setThemes] = useState<Option[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NewMassSelection>({
    title: "",
    date: new Date(),
    liturgicalYear: null,
    liturgicalSeason: null,
    themes: [],
    pastoralFocus: "",
    liturgy: "",
    isPublic: false,
    parts: [],
  });

  useEffect(() => {
    // Initialize form based on template
    const parts = templateParts[template] || [];
    const initialParts: NewMassSelectionPart[] = parts.map(
      (partName, index) => ({
        id: (index + 1).toString(),
        partName,
        keySignature: null,
        notes: "",
        songTitle: "",
      })
    );

    // If blank template, start with one empty part
    if (parts.length === 0) {
      initialParts.push({
        id: "1",
        partName: "",
        keySignature: null,
        notes: "",
        songTitle: "",
      });
    }

    setForm((prev) => ({
      ...prev,
      parts: initialParts,
    }));
  }, [template]);

  const addPart = () => {
    const newPart: NewMassSelectionPart = {
      id: Date.now().toString(),
      partName: "",
      keySignature: null,
      notes: "",
      songTitle: "",
    };
    setForm((prev) => ({
      ...prev,
      parts: [...prev.parts, newPart],
    }));
  };

  const removePart = (id: string) => {
    if (form.parts.length > 1) {
      setForm((prev) => ({
        ...prev,
        parts: prev.parts.filter((part) => part.id !== id),
      }));
    }
  };

  const updatePart = (id: string, updates: Partial<MassPart>) => {
    setForm((prev) => ({
      ...prev,
      parts: prev.parts.map((part) =>
        part.id === id ? { ...part, ...updates } : part
      ),
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/mass-selections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
        }),
      });

      if (response.ok) {
        const selection = await response.json();
        router.push(`/mass-selections/${selection.id}`);
      } else {
        console.error("Error creating mass selection");
      }
    } catch (error) {
      console.error("Error creating mass selection:", error);
    } finally {
      setSaving(false);
    }
  };

  const canSubmit =
    form.parts.length > 0 && form.parts.some((part) => part.partName);

  const getTemplateName = (templateId: string) => {
    const names: Record<string, string> = {
      "sunday-mass": "Sunday Mass",
      wedding: "Wedding",
      ordination: "Ordination",
      funeral: "Funeral",
      blank: "Blank Template",
    };
    return names[templateId] || "Custom Template";
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/mass-selections/new")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Mass Selection</h1>
          <p className="text-muted-foreground mt-1">
            Using template:{" "}
            <span className="font-medium">{getTemplateName(template)}</span>
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Basic Information</CardTitle>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={form.isPublic}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isPublic: checked }))
                }
              />
              <Label htmlFor="isPublic" className="text-sm">
                Make this selection public
              </Label>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Christmas Eve Mass"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      date: new Date(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liturgical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Liturgical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="liturgicalYear">Liturgical Year</Label>
                <Select
                  value={form.liturgicalYear ?? undefined}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      liturgicalYear: getEnum(LiturgicalYear, value) ?? null,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="liturgicalSeason">Liturgical Season</Label>
                <Select
                  value={form.liturgicalSeason ?? undefined}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      liturgicalSeason:
                        getEnum(LiturgicalSeason, value) ?? null,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem key={season.value} value={season.value}>
                        {season.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="themes">Themes</Label>
              <MultipleSelector
                value={themes}
                defaultOptions={[]}
                onChange={(selected) => {
                  setThemes(selected);
                  setForm((prev) => ({
                    ...prev,
                    themes: selected.map((opt) => opt.value),
                  }));
                }}
                placeholder="e.g., Joy, Peace, Resurrection"
                creatable
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pastoralFocus">Pastoral Focus</Label>
                <Input
                  id="pastoralFocus"
                  value={form.pastoralFocus || undefined}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      pastoralFocus: e.target.value,
                    }))
                  }
                  placeholder="e.g., Youth Ministry, Family"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="liturgy">Liturgy</Label>
                <Input
                  id="liturgy"
                  value={form.liturgy || undefined}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, liturgy: e.target.value }))
                  }
                  placeholder="e.g., Sunday Mass, Wedding"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mass Parts */}
        <Card>
          <CardHeader>
            <CardTitle>Mass Parts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.parts.map((part, index) => (
              <MassPartRow
                key={part.id}
                part={part}
                index={index}
                onUpdate={(updates) => updatePart(part.id, updates)}
                onRemove={() => removePart(part.id)}
                canRemove={form.parts.length > 1}
              />
            ))}

            <div className="flex justify-center pt-4">
              <Button
                onClick={addPart}
                variant="outline"
                className="gap-2 bg-transparent"
              >
                <Plus className="h-4 w-4" />
                Add Part
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/mass-selections")}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              // onClick={handleSubmit}
              // disabled={!canSubmit || saving}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || saving}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Creating..." : "Save Selection"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
