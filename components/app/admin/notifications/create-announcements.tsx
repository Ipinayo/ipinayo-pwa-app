"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Megaphone, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { createAnnouncementAction } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { withToast } from "@/lib/with-toast";

interface UserOption {
  id: string;
  name: string | null;
  email: string;
}

export function CreateAnnouncement({ users }: { users: UserOption[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("general");
  const [targetMode, setTargetMode] = useState<"all" | "admins" | "specific">(
    "all",
  );
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [channels, setChannels] = useState<("inApp" | "push" | "email")[]>([
    "inApp",
    "push",
  ]);
  const [isSending, setIsSending] = useState(false);
  const anchor = useComboboxAnchor();

  const handleChannelToggle = (channel: "inApp" | "push" | "email") => {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel],
    );
  };

  const getSelectedUserNames = (): string => {
    const selected = users.filter((u) => selectedUsers.includes(u.id));
    if (selected.length === 0) return "No users selected";
    if (selected.length === 1) return selected[0].name ?? selected[0].email;
    return `${selected.length} users selected`;
  };

  const handleSend = async () => {
    setIsSending(true);
    const { error } = await withToast(
      () =>
        createAnnouncementAction({
          title,
          message,
          type,
          targetUsers: targetMode,
          selectedUserIds:
            targetMode === "specific" ? selectedUsers : undefined,
          inApp: channels.includes("inApp"),
          email: channels.includes("email"),
          push: channels.includes("push"),
        }),
      {
        loading: "Sending announcement...",
        success: () => "Announcement sent successfully!",
        error: (err) => err?.message ?? "Failed to send announcement.",
      },
    );
    setIsSending(false);
    if (!error) {
      router.push("/admin/notifications");
    }
  };

  const canSend =
    !!title &&
    !!message &&
    (targetMode !== "specific" || selectedUsers.length > 0) &&
    channels.length > 0;

  return (
    <div className="mx-auto max-w-6xl w-full space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/notifications">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Notifications
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-display font-bold">Create Announcement</h1>
        <p className="text-muted-foreground">
          Send a message immediately to platform users
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Announcement Details</CardTitle>
              <CardDescription>
                Provide the announcement content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., New Feature Launch"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Write your announcement message here..."
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {message.length} characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Announcement Type</Label>
                <Select value={type} onValueChange={(value) => setType(value)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">
                      Feature Announcement
                    </SelectItem>
                    <SelectItem value="maintenance">
                      Maintenance Notice
                    </SelectItem>
                    <SelectItem value="general">General Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Targeting */}
          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
              <CardDescription>
                Who should receive this announcement?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={targetMode}
                onValueChange={(value: "all" | "admins" | "specific") =>
                  setTargetMode(value)
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    All Users
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admins" id="admins" />
                  <Label
                    htmlFor="admins"
                    className="font-normal cursor-pointer"
                  >
                    Administrators Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="specific" />
                  <Label
                    htmlFor="specific"
                    className="font-normal cursor-pointer"
                  >
                    Specific Users
                  </Label>
                </div>
              </RadioGroup>

              {targetMode === "specific" && (
                <div className="space-y-2 mt-4 pt-4 border-t">
                  <Label>Select Users</Label>
                  <Combobox
                    multiple
                    value={users.filter((u) => selectedUsers.includes(u.id))}
                    onValueChange={(newUsers) =>
                      setSelectedUsers(newUsers.map((u) => u.id))
                    }
                    items={users.filter((u) => !selectedUsers.includes(u.id))}
                    isItemEqualToValue={(a, b) => a.id === b.id}
                    filter={(user: UserOption, query: string) => {
                      const q = query.toLowerCase();
                      return (
                        (user.name?.toLowerCase().includes(q) ?? false) ||
                        user.email.toLowerCase().includes(q)
                      );
                    }}
                  >
                    <ComboboxChips ref={anchor}>
                      {users
                        .filter((u) => selectedUsers.includes(u.id))
                        .map((user) => (
                          <ComboboxChip key={user.id}>
                            {user.name ?? user.email}
                          </ComboboxChip>
                        ))}
                      <ComboboxChipsInput placeholder="Search users by name or email..." />
                    </ComboboxChips>
                    <ComboboxContent anchor={anchor}>
                      <ComboboxList>
                        {(user: UserOption) => (
                          <ComboboxItem key={user.id} value={user}>
                            <p className="text-sm font-medium">
                              {user.name ?? user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                      <ComboboxEmpty>No users found</ComboboxEmpty>
                    </ComboboxContent>
                  </Combobox>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Channels */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Choose how users will receive this announcement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inApp"
                  checked={channels.includes("inApp")}
                  onCheckedChange={() => handleChannelToggle("inApp")}
                />
                <Label htmlFor="inApp" className="font-normal cursor-pointer">
                  In-App Notification
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="push"
                  checked={channels.includes("push")}
                  onCheckedChange={() => handleChannelToggle("push")}
                />
                <Label htmlFor="push" className="font-normal cursor-pointer">
                  Push Notification
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={channels.includes("email")}
                  onCheckedChange={() => handleChannelToggle("email")}
                />
                <Label htmlFor="email" className="font-normal cursor-pointer">
                  Email
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Note: In-App and Push are enabled by default for immediate
                delivery.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How users will see it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Megaphone className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-medium wrap-break-word">
                      {title || "Announcement Title"}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-3 wrap-break-word">
                      {message || "Your message will appear here..."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Recipients
                  </p>
                  <p className="text-sm">
                    {targetMode === "all"
                      ? "All Users"
                      : targetMode === "admins"
                        ? "Administrators Only"
                        : getSelectedUserNames()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Channels
                  </p>
                  <p className="text-sm">
                    {channels.length > 0
                      ? channels.join(", ")
                      : "None selected"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button disabled={!canSend || isSending}>
            <Send className="mr-2 h-4 w-4" />
            Send Announcement
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              This announcement will be sent immediately to{" "}
              <span className="font-medium">
                {targetMode === "all"
                  ? "all users"
                  : targetMode === "admins"
                    ? "administrators"
                    : `${selectedUsers.length} selected user(s)`}
              </span>
              {". This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend}>Send Now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
