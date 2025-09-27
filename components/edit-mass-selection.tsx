"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Music, Save, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface MassPart {
  id?: string;
  partName: string;
  keySignature: string;
  notes: string;
}

interface MassSelection {
  id: string;
  title: string;
  date: string;
  templateType: string;
  liturgicalYear?: string;
  season?: string;
  themes?: string;
  pastoralFocus?: string;
  isPublic: boolean;
  parts: MassPart[];
}

interface EditMassSelectionProps {
  id: string;
}

export function EditMassSelection({ id }: EditMassSelectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selection, setSelection] = useState<MassSelection | null>(null);

  useEffect(() => {
    fetchSelection();
  }, [id]);

  const fetchSelection = async () => {
    try {
      const response = await fetch(`/api/mass-selections/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelection({
          ...data,
          date: new Date(data.date).toISOString().split("T")[0], // Format for input[type="date"]
        });
      } else if (response.status === 403) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching selection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePartChange = (
    index: number,
    field: keyof MassPart,
    value: string
  ) => {
    if (!selection) return;

    const updatedParts = selection.parts.map((part, i) =>
      i === index ? { ...part, [field]: value } : part
    );
    setSelection({ ...selection, parts: updatedParts });
  };

  const handleSubmit = async () => {
    if (!selection) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/mass-selections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selection),
      });

      if (response.ok) {
        router.push(`/view/${id}`);
      } else {
        console.error("Error updating mass selection");
      }
    } catch (error) {
      console.error("Error updating mass selection:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading mass selection...</span>
        </div>
      </div>
    );
  }

  if (!selection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">
            Mass Selection Not Found
          </h2>
          <p className="text-muted-foreground mb-4">
            The mass selection you're looking for doesn't exist or you don't
            have permission to edit it.
          </p>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/view/${id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to View
              </Link>
            </Button>
            <Image
              src="/images/logo.png"
              alt="logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
            <Separator orientation="vertical" className="h-8" />
            <h1 className="text-2xl font-display text-primary">
              Edit Mass Selection
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-display text-foreground mb-2">
              Edit: {selection.title}
            </h2>
            <p className="text-muted-foreground">
              Make changes to your Mass selection
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mass Details</CardTitle>
              <CardDescription>
                Update the basic information for your Mass selection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Mass Title *</Label>
                  <Input
                    id="title"
                    value={selection.title}
                    onChange={(e) =>
                      setSelection({ ...selection, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selection.date}
                    onChange={(e) =>
                      setSelection({ ...selection, date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="liturgicalYear">Liturgical Year</Label>
                  <Select
                    value={selection.liturgicalYear || ""}
                    onValueChange={(value) =>
                      setSelection({ ...selection, liturgicalYear: value })
                    }
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
                      checked={selection.isPublic}
                      onCheckedChange={(checked) =>
                        setSelection({ ...selection, isPublic: checked })
                      }
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
                  value={selection.themes || ""}
                  onChange={(e) =>
                    setSelection({ ...selection, themes: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pastoralFocus">Pastoral Focus</Label>
                <Textarea
                  id="pastoralFocus"
                  value={selection.pastoralFocus || ""}
                  onChange={(e) =>
                    setSelection({
                      ...selection,
                      pastoralFocus: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Mass Parts
              </CardTitle>
              <CardDescription>
                Update the musical selections for each part of the Mass
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selection.parts.map((part, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold text-lg">{part.partName}</h4>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`key-${index}`}>Key Signature</Label>
                      <Input
                        id={`key-${index}`}
                        placeholder="e.g., C Major, G Major"
                        value={part.keySignature || ""}
                        onChange={(e) =>
                          handlePartChange(
                            index,
                            "keySignature",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`notes-${index}`}>Notes</Label>
                      <Input
                        id={`notes-${index}`}
                        placeholder="Additional notes or instructions"
                        value={part.notes || ""}
                        onChange={(e) =>
                          handlePartChange(index, "notes", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link href={`/view/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
