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

import AppSelect from "@/components/common/app-select";
import { DraftMassSelection } from "@/types/schemas/mass-selections";
import { Input } from "@/components/ui/input";
import { SelectOption } from "@/types/components/select";
import { Textarea } from "@/components/ui/textarea";
import { getEnumByKey } from "@/lib/utils";
import { keySignatureItems } from "@/lib/constants";
import { useFormContext } from "react-hook-form";

interface MassPartFormProps {
  mode: "draft" | "edit";
  index: number;
  partNames: SelectOption[];
}

export function MassPartForm({ mode, index, partNames }: MassPartFormProps) {
  const formEdit = useFormContext<NewMassSelection>();
  const formDraft = useFormContext<DraftMassSelection>();
  const form = mode === "edit" ? formEdit : formDraft;

  return (
    <div className="bg-card grid gap-4 rounded-lg border p-3 sm:p-4 transition-colors">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control as any}
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
                  invalid={!!fieldState.error}
                  inputProps={{ onBlur: field.onBlur }}
                  creatable
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
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
        control={form.control as any}
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
        control={form.control as any}
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
