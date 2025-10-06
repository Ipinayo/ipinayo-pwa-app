"use client";

import { Check, ChevronDown, Trash2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Control, useController } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { KeySignature, NewMassSelection } from "@/types/models";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, getEnumByKey } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { keySignatureItems } from "@/lib/constants";
import { useState } from "react";

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
  const [partNameOpen, setPartNameOpen] = useState(false);

  const { field: partNameField } = useController({
    name: `parts.${index}.partName`,
    control,
  });

  const handlePartNameSelect = (partName: string) => {
    partNameField.onChange(partName);
    setPartNameOpen(false);
  };

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
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Part Name <span className="text-destructive">*</span>
              </FormLabel>
              <Popover open={partNameOpen} onOpenChange={setPartNameOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={partNameOpen}
                      className="w-full justify-between bg-transparent"
                    >
                      {field.value || "Select or type part name..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search part names..."
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                    <CommandList>
                      <CommandEmpty>No part names found.</CommandEmpty>
                      <CommandGroup>
                        {commonPartNames
                          .filter((name) =>
                            name
                              .toLowerCase()
                              .includes(field.value.toLowerCase())
                          )
                          .map((partName) => (
                            <CommandItem
                              key={partName}
                              value={partName}
                              onSelect={() => handlePartNameSelect(partName)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === partName
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {partName}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
