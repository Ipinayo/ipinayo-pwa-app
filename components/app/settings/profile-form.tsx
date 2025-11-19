"use client";

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
import { MapPin, Music, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  genreOptions,
  instrumentOptions,
  vocalFachOptions,
} from "@/lib/constants";
import {
  getValuesFromOptions,
  transformStringsToOptions,
  transformToGroupedOptions,
} from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LocationSelector from "@/components/common/location-selector";
import MultipleSelector from "@/components/common/multiple-selector";
import { Textarea } from "@/components/ui/textarea";
import { UpdateUserProfile } from "@/types/utils";
import { UserProfile } from "@/types/models";
import { updateUserProfileAction } from "@/lib/actions/user";
import { updateUserProfileSchema } from "@/types/schemas/user";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { withToast } from "@/lib/with-toast";
import { zodResolver } from "@hookform/resolvers/zod";

export default function ProfileForm({ user }: { user: UserProfile }) {
  const router = useRouter();

  const form = useForm<UpdateUserProfile>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      name: user.user.name,
      bio: user.bio,
      headline: user.headline,
      instruments: user.instruments || [],
      vocalFach: user.vocalFach,
      favoriteGenres: user.favoriteGenres || [],
      parishName: user.parishName,
      choirName: user.choirName,
      parishLocation: user.parishLocation,
    },
  });

  const handleSubmit = async (data: UpdateUserProfile) => {
    await withToast(() => updateUserProfileAction(data), {
      success: () => {
        router.push("/profile");
        return "Profile updated successfully!";
      },
    });
  };

  // Reset form when user changes
  useEffect(() => {
    form.reset({
      name: user.user.name,
      bio: user.bio,
      headline: user.headline,
      instruments: user.instruments || [],
      vocalFach: user.vocalFach,
      favoriteGenres: user.favoriteGenres || [],
      parishName: user.parishName,
      choirName: user.choirName,
      parishLocation: user.parishLocation,
    });
  }, [user]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Headline</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="e.g. Music Director | Organist | Composer | Soprano"
                      maxLength={150}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {field.value?.length || 0}/150 characters
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader>
            <CardTitle>Bio</CardTitle>
            <CardDescription>Tell us about yourself</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      rows={5}
                      placeholder="Share your story, experience, and passion for liturgical music..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Choir & Parish Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Choir & Parish Information
            </CardTitle>
            <CardDescription>
              Your parish and choir details. If set, will be used to prefill
              your selections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="parishName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parish Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Your parish name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="choirName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Choir Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Your choir name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <LocationSelector form={form} />
          </CardContent>
        </Card>

        {/* Musical Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Musical Profile
            </CardTitle>
            <CardDescription>
              Your musical skills and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instruments */}
            <FormField
              control={form.control}
              name="instruments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruments</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      value={transformStringsToOptions(field.value || [])}
                      defaultOptions={transformToGroupedOptions(
                        instrumentOptions,
                        "name",
                        "name",
                        "children"
                      )}
                      onChange={(selected) =>
                        field.onChange(getValuesFromOptions(selected))
                      }
                      placeholder="Add instruments"
                      creatable={false}
                      groupBy="group"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vocalFach"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vocal Fach</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vocal fach" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vocalFachOptions.map((fach) => (
                        <SelectItem key={fach} value={fach}>
                          {fach}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Favorite Genres */}
            <FormField
              control={form.control}
              name="favoriteGenres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favorite Genres</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      value={transformStringsToOptions(field.value || [])}
                      defaultOptions={transformStringsToOptions(genreOptions)}
                      onChange={(selected) =>
                        field.onChange(getValuesFromOptions(selected))
                      }
                      placeholder="Select genres"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
