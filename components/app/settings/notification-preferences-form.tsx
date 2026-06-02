"use client";

import { BookOpen, FileClock, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  NotificationPreferenceItem,
  updateNotificationPreferencesAction,
} from "@/lib/actions/notification-preference";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { withToast } from "@/lib/with-toast";

const CHANNELS = [
  { key: "inApp", label: "In-app" },
  { key: "email", label: "Email" },
  { key: "push", label: "Push" },
] as const;

type ChannelKey = (typeof CHANNELS)[number]["key"];

const GROUPS: {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    key: "selection",
    label: "Selections",
    description: "Notifications about your liturgical selections",
    icon: BookOpen,
  },
  {
    key: "draft",
    label: "Drafts",
    description: "Notifications about your drafts",
    icon: FileClock,
  },
];

export function NotificationPreferencesForm({
  preferences,
}: {
  preferences: NotificationPreferenceItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<NotificationPreferenceItem[]>(preferences);
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(
    () => JSON.stringify(items) !== JSON.stringify(preferences),
    [items, preferences]
  );

  const toggle = (event: string, channel: ChannelKey, value: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.event === event ? { ...item, [channel]: value } : item
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await withToast(
      () =>
        updateNotificationPreferencesAction(
          items.map(({ event, inApp, email, push }) => ({
            event,
            inApp,
            email,
            push,
          }))
        ),
      {
        loading: "Saving preferences...",
        success: "Notification preferences updated",
      }
    );
    setSaving(false);
    if (!error) router.refresh();
  };

  const groups = GROUPS.map((group) => ({
    ...group,
    events: items.filter((item) => item.event.startsWith(`${group.key}.`)),
  })).filter((group) => group.events.length > 0);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <Card key={group.key}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <group.icon className="h-5 w-5" />
              {group.label}
            </CardTitle>
            <CardDescription>{group.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {group.events.map((item, index) => (
              <div key={item.event}>
                {index > 0 && <Separator className="my-2" />}
                <div className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5 sm:max-w-sm">
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                    {CHANNELS.map((channel) => (
                      <div key={channel.key} className="flex items-center gap-2">
                        <Switch
                          id={`${item.event}-${channel.key}`}
                          checked={item[channel.key]}
                          onCheckedChange={(value) =>
                            toggle(item.event, channel.key, value)
                          }
                        />
                        <Label
                          htmlFor={`${item.event}-${channel.key}`}
                          className="cursor-pointer text-sm text-muted-foreground"
                        >
                          {channel.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="bg-primary hover:bg-primary/90"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
