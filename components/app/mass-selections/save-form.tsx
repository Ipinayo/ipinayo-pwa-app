"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  LiturgicalSeason,
  LiturgicalYear,
  Location,
  MassSelectionWithParts,
  NewMassSelection,
} from "@/types/models";
import { Plus, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSelection,
  updateSelection,
} from "@/lib/actions/mass-selections";
import {
  getEnum,
  getValuesFromOptions,
  transformStringsToOptions,
} from "@/lib/utils";
import {
  liturgicalSeasonItems,
  liturgicalYearItems,
  liturgyTemplates,
} from "@/lib/constants";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import DateSelect from "@/components/common/date-select";
import { Input } from "@/components/ui/input";
import LocationSelector from "@/components/common/location-selector";
import { MassPartRow } from "./mass-part-row";
import MultipleSelector from "@/components/common/multiple-selector";
import { Switch } from "@/components/ui/switch";
import { createMassSelectionSchema } from "@/types/schemas/mass-selections";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { withToast } from "@/lib/with-toast";
import { zodResolver } from "@hookform/resolvers/zod";

type SaveFormProps =
  | {
      mode: "create";
      template: string;
      themes: string[];
      partNames: string[];
      parishLocation: Location | null;
      choirName: string | null;
      parishName: string | null;
      selection?: never;
    }
  | {
      mode: "edit";
      selection: MassSelectionWithParts;
      themes: string[];
      partNames: string[];
      parishLocation?: never;
      choirName?: never;
      parishName?: never;
      template?: never;
    };

// Initialize default values
const getDefaultValues = (props: SaveFormProps): NewMassSelection => {
  if (props.mode === "edit") {
    const { selection } = props;
    return {
      ...selection,
      themes: selection.themes.map((theme) => theme.name),
    };
  }

  const liturgy = liturgyTemplates.find((temp) => temp.id === props.template);
  const parts = liturgy?.parts || [];

  const initialParts =
    parts.length > 0
      ? parts.map((partName, index) => ({
          id: (index + 1).toString(),
          partName,
          keySignature: null,
          notes: "",
          songTitle: "",
        }))
      : [
          {
            id: "1",
            partName: "",
            keySignature: null,
            notes: "",
            songTitle: "",
          },
        ];

  return {
    title: "",
    date: new Date(),
    liturgicalYear: null,
    liturgicalSeason: null,
    themes: liturgy?.themes || [],
    pastoralFocus: "",
    liturgy: liturgy?.liturgy || "",
    isPublic: true,
    parishLocation: props.parishLocation,
    choirName: props.choirName,
    parishName: props.parishName,
    parts: initialParts,
  };
};

export default function SaveForm(props: SaveFormProps) {
  const router = useRouter();

  const form = useForm<NewMassSelection>({
    resolver: zodResolver(createMassSelectionSchema),
    defaultValues: getDefaultValues(props),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "parts",
  });

  const { mode } = props;

  const addPart = () => {
    append({
      id: Date.now().toString(),
      partName: "",
      keySignature: null,
      notes: "",
      songTitle: "",
    });
  };

  const handleSubmit = async (data: NewMassSelection) => {
    if (mode === "edit") {
      const { selection } = props;
      await withToast(() => updateSelection(selection.id, data), {
        success: () => {
          router.push(`/liturgical-selections/${selection.id}`);
          return "Successfully updated selection!";
        },
      });
    } else {
      await withToast(() => createSelection(data), {
        success: (newSelection) => {
          router.push(`/liturgical-selections/${newSelection.id}`);
          return "Successfully created selection!";
        },
      });
    }
  };

  // Reset form when template changes
  useEffect(() => {
    form.reset(getDefaultValues(props));
  }, [props]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Basic Information</CardTitle>
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Make this selection public
                  </FormLabel>
                </FormItem>
              )}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title<span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Christmas Eve Mass"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Date<span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <DateSelect
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Choir and Parish Information */}
        <Card>
          <CardHeader>
            <CardTitle>Choir and Parish Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="choirName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choir Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., St. Joseph Choir"
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parishName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parish Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., St. Joseph Parish"
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LocationSelector form={form} />
          </CardContent>
        </Card>

        {/* Liturgical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Liturgical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="liturgicalYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liturgical Year</FormLabel>
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
                    <FormLabel>Liturgical Season</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="themes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Themes</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      value={transformStringsToOptions(field.value)}
                      defaultOptions={transformStringsToOptions(props.themes)}
                      onChange={(selected) =>
                        field.onChange(getValuesFromOptions(selected))
                      }
                      placeholder="e.g., Joy, Peace, Resurrection"
                      creatable
                      className="capitalize"
                      dropdownClassName="capitalize"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="pastoralFocus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pastoral Focus</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Youth Ministry, Family"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="liturgy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liturgy</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Sunday Mass, Wedding"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Liturgy Parts */}
        <Card>
          <CardHeader>
            <CardTitle>Liturgy Parts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <MassPartRow
                key={field.id}
                index={index}
                control={form.control}
                canRemove={fields.length > 1}
                partNames={props.partNames}
                onRemove={() => remove(index)}
              />
            ))}

            <div className="flex justify-center pt-4">
              <Button
                type="button"
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
            type="button"
            variant="outline"
            onClick={() => router.push("/liturgical-selections")}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {form.formState.isSubmitting ? "Saving..." : "Save Selection"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
