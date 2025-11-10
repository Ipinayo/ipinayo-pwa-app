"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { KeySignature, NewMassSelection } from "@/types/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, getEnumByKey, transformStringsToOptions } from "@/lib/utils";

import AppSelect from "@/components/common/app-select";
import { Button } from "@/components/ui/button";
import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { keySignatureItems } from "@/lib/constants";

interface MassPartRowProps {
  index: number;
  control: Control<NewMassSelection>;
  onRemove: () => void;
  canRemove: boolean;
}

const commonPartNames = [
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
  "Prelude",
  "Processional",
  "Opening Hymn",
  "Litany of Saints",
  "Te Deum",
  "Song of Farewell",
];

export function MassPartRow({
  index,
  control,
  onRemove,
  canRemove,
}: MassPartRowProps) {
  return (
    <div className="bg-card grid gap-4 rounded-lg border p-4">
      <div className="flex items-center justify-end">
        {/* <h4 className="font-medium">Part {index + 1}</h4> */}
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name={`parts.${index}.partName`}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>
                Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <AppSelect
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  options={transformStringsToOptions(commonPartNames)}
                  placeholder="Select or type part name..."
                  className={cn(
                    "capitalize",
                    fieldState.invalid
                      ? "ring-destructive/20 dark:ring-destructive/40 border-destructive"
                      : ""
                  )}
                  dropdownClassName="capitalize"
                  inputProps={{ className: "capitalize" }}
                  creatable
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`parts.${index}.keySignature`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Signature</FormLabel>
              <Select
                value={field.value || undefined}
                onValueChange={(value) =>
                  field.onChange(getEnumByKey(KeySignature, value))
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select key" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {keySignatureItems.map((key) => (
                    <SelectItem key={key.value} value={key.value}>
                      {key.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={`parts.${index}.songTitle`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Song Title <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Or type custom title..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`parts.${index}.notes`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="e.g., Verses 1, 2, and 4 only"
                {...field}
                value={field.value || ""}
                rows={2}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
