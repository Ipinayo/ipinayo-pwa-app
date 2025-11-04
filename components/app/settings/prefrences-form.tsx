"use client";

import { Bell, Music, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LiturgicalSeason, LiturgicalYear } from "@/types/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { liturgicalSeasonItems, liturgicalYearItems } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { getEnum } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const preferencesSchema = z.object({
  liturgicalYear: z.string().nullable(),
  liturgicalSeason: z.string().nullable(),
  notificationsEnabled: z.boolean(),
  emailNotifications: z.boolean(),
  soundEnabled: z.boolean(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

interface UserPreferences {
  defaultLiturgicalSeason: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
}

export function PreferencesPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultLiturgicalSeason: "ordinary-time",
    notificationsEnabled: true,
    emailNotifications: false,
    soundEnabled: true,
  });
  const [saving, setSaving] = useState(false);

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      liturgicalYear: "C",
      liturgicalSeason: "CHRISTMAS",
      notificationsEnabled: true,
      emailNotifications: false,
      soundEnabled: true,
    },
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
    }, 500);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
        {/* Liturgical Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Liturgical Settings
            </CardTitle>
            <CardDescription>
              Configure your liturgical preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="liturgicalYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Liturgical Year</FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) =>
                      field.onChange(
                        value === "none"
                          ? null
                          : getEnum(LiturgicalYear, value) ?? null
                      )
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {liturgicalYearItems.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                      <SelectItem variant="destructive" value="none">
                        Clear Selection
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="liturgicalSeason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Liturgical Season</FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) =>
                      field.onChange(
                        value === "none"
                          ? null
                          : getEnum(LiturgicalSeason, value) ?? null
                      )
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {liturgicalSeasonItems.map((season) => (
                        <SelectItem key={season.value} value={season.value}>
                          {season.label}
                        </SelectItem>
                      ))}
                      <SelectItem variant="destructive" value="none">
                        Clear Selection
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications in the app
                </p>
              </div>
              <Switch
                checked={preferences.notificationsEnabled}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    notificationsEnabled: checked,
                  })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates and reminders
                </p>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    emailNotifications: checked,
                  })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sound Effects</Label>
                <p className="text-sm text-muted-foreground">
                  Play sounds for notifications
                </p>
              </div>
              <Switch
                checked={preferences.soundEnabled}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, soundEnabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
