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
import { cn, getEnumByKey } from "@/lib/utils";

import AppSelect from "@/components/common/app-select";
import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { SelectOption } from "@/types/components/select";
import { Textarea } from "@/components/ui/textarea";
import { keySignatureItems } from "@/lib/constants";

interface MassPartFormProps {
  index: number;
  control: Control<NewMassSelection>;
  partNames: SelectOption[];
}

export function MassPartForm({ index, control, partNames }: MassPartFormProps) {
  return (
    <div className="bg-card grid gap-4 rounded-lg border p-3 sm:p-4 transition-colors">
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
                  options={partNames}
                  placeholder="Select or type part name..."
                  className={cn(
                    fieldState.invalid
                      ? "ring-destructive/20 dark:ring-destructive/40 border-destructive"
                      : ""
                  )}
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
              <Input placeholder="Enter song title..." {...field} />
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
                placeholder="e.g., Hymn 1 - Verses 1, 2, and 4 only"
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
