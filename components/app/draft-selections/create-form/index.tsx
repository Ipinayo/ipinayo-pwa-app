"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  LiturgicalSeason,
  LiturgicalYear,
  MassSelectionDraft,
} from "@/types/models";
import { Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSelection } from "@/lib/actions/mass-selections";
import {
  getEnum,
  getValuesFromOptions,
  normalizeDate,
  transformStringsToOptions,
} from "@/lib/utils";
import { liturgicalSeasonItems, liturgicalYearItems } from "@/lib/constants";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import DateSelect from "@/components/common/date-select";
import { Input } from "@/components/ui/input";
import LocationSelector from "@/components/common/location-selector";
import MultipleSelector from "@/components/common/multiple-selector";
import { Switch } from "@/components/ui/switch";
import {
  createMassSelectionSchema,
  DraftMassSelection,
  draftMassSelectionSchema,
} from "@/types/schemas/mass-selections";
import { useMemo } from "react";
import { withToast } from "@/lib/with-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import MassPartRow from "@/components/common/mass-part-row";
import { useAppNavigation } from "@/contexts/AppNavigationContext";
import { useDraftAutosave } from "@/hooks/use-draft-autosave";
import { toast } from "sonner";

type CreateFormProps = {
  draftSelection: MassSelectionDraft;
  themes: string[];
  partNames: string[];
};

const getDefaultValues = (props: CreateFormProps): DraftMassSelection => {
  let formattedParts;

  const { createdAt, updatedAt, parts, parishLocation, ...selection } =
    props.draftSelection;

  if (parts) {
    try {
      formattedParts = Array.isArray(parts)
        ? parts.map((part, index) => {
            const result =
              draftMassSelectionSchema.shape.parts.element.safeParse(part);
            if (result.success) {
              return result.data;
            } else {
              console.error(
                "Invalid part data:",
                result.error,
                "Using default values.",
              );
              return {
                id: `temp-${Date.now()}-${index}`,
                order: index,
                partName: "",
                keySignature: null,
                notes: "",
                songTitle: "",
              };
            }
          })
        : [
            {
              id: "temp-1",
              order: 0,
              partName: "",
              keySignature: null,
              notes: "",
              songTitle: "",
            },
          ];
    } catch (error) {
      console.error("Failed to parse parts JSON:", error);
      formattedParts = [
        {
          id: "temp-1",
          order: 0,
          partName: "",
          keySignature: null,
          notes: "",
          songTitle: "",
        },
      ];
    }
  }

  let initialParishLocation;
  const result =
    draftMassSelectionSchema.shape.parishLocation.safeParse(parishLocation);
  if (result.success) {
    initialParishLocation = result.data;
  } else {
    console.error(result.error);
  }

  return {
    ...selection,
    parishLocation: initialParishLocation || null,
    parts: formattedParts || [],
  };
};

export default function CreateForm(props: Readonly<CreateFormProps>) {
  const { replacePath, handleBack } = useAppNavigation();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const form = useForm<DraftMassSelection>({
    resolver: zodResolver(draftMassSelectionSchema),
    defaultValues: getDefaultValues(props),
    mode: "onBlur",
  });

  const { fields, append, remove, move, insert } = useFieldArray({
    control: form.control,
    name: "parts",
  });

  const { save } = useDraftAutosave({
    draftId: props.draftSelection.id,
    form,
    onSaveSuccess: (isAutoSave) => {
      if (!isAutoSave) {
        toast.success("Successfully saved draft!");
        handleBack("/dashboard");
      }
    },
    onSaveError: () => {
      toast.error("Error saving draft");
    },
  });

  const itemIds = useMemo(() => fields.map((item) => item.id), [fields]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Use the move function from useFieldArray
    move(oldIndex, newIndex);
  };

  const addPart = (afterIndex?: number) => {
    const insertIndex =
      afterIndex === undefined ? fields.length : afterIndex + 1;

    const newPart = {
      id: `temp-${Date.now()}`,
      order: insertIndex,
      partName: "",
      keySignature: null,
      notes: "",
      songTitle: "",
    };

    // Use insert if adding at a specific position, append if adding at the end
    if (afterIndex === undefined) {
      append(newPart);
    } else {
      insert(insertIndex, newPart);
    }
  };

  const removePart = (index: number) => {
    if (fields.length > 1) {
      // Use remove from useFieldArray
      remove(index);
    }
  };

  const handleSubmit = async (data: DraftMassSelection) => {
    const validationResult = createMassSelectionSchema.safeParse(data);

    if (!validationResult.success) {
      // Set errors on form fields
      validationResult.error.issues.forEach((error) => {
        const fieldName = error.path.join(".") as keyof DraftMassSelection;

        form.setError(fieldName, {
          type: "manual",
          message: error.message,
        });
      });

      return;
    }

    const selection = validationResult.data;

    selection.date = normalizeDate(selection.date);
    selection.parts = selection.parts.map((part, idx) => ({
      ...part,
      order: idx,
    }));

    await withToast(() => createSelection(selection, props.draftSelection.id), {
      success: (newSelection) => {
        replacePath(`/liturgical-selections/${newSelection.id}`);
        return "Successfully created selection!";
      },
    });
  };

  const partNames = transformStringsToOptions(props.partNames);

  return (
    <FormProvider {...form}>
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
                        value={field.value || undefined}
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
            <LocationSelector />
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
                            : (getEnum(LiturgicalYear, value) ?? null),
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
                            : (getEnum(LiturgicalSeason, value) ?? null),
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
              render={({ field, fieldState }) => (
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
                      invalid={!!fieldState.error}
                      inputProps={{ onBlur: field.onBlur }}
                      maxSelected={10}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {field.value?.length || 0}/10 themes
                  </p>
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
            <CardDescription>
              Drag to reorder parts. Click "Insert Part" to add parts at
              specific positions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field, index) => (
                  <MassPartRow
                    key={field.id}
                    partId={field.id}
                    partNames={partNames}
                    mode="draft"
                    index={index}
                    onRemove={() => removePart(index)}
                    canRemove={fields.length > 1}
                    onInsertPart={() => addPart(index)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={() => save()}>
            Save as Draft
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
    </FormProvider>
  );
}
