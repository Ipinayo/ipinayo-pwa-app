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
import { KeySignature, NewMassSelectionPart } from "@/types/models";
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { keySignatureItems } from "@/lib/constants";
import { useState } from "react";

interface MassPartRowProps {
  part: NewMassSelectionPart;
  index: number;
  onUpdate: (updates: Partial<NewMassSelectionPart>) => void;
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
  part,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: MassPartRowProps) {
  const [partNameOpen, setPartNameOpen] = useState(false);

  const handlePartNameSelect = (partName: string) => {
    onUpdate({ partName });
    setPartNameOpen(false);
  };

  return (
    <div className="bg-card grid gap-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Part {index + 1}</h4>
        {canRemove && (
          <Button
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
        <div className="space-y-2">
          <Label>Part Name</Label>
          <Popover open={partNameOpen} onOpenChange={setPartNameOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={partNameOpen}
                className="w-full justify-between bg-transparent"
              >
                {part.partName || "Select or type part name..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder="Search part names..."
                  value={part.partName}
                  onValueChange={(value) => onUpdate({ partName: value })}
                />
                <CommandList>
                  <CommandEmpty>No part names found.</CommandEmpty>
                  <CommandGroup>
                    {commonPartNames
                      .filter((name) =>
                        name.toLowerCase().includes(part.partName.toLowerCase())
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
                              part.partName === partName
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
        </div>

        <div className="space-y-2">
          <Label>Key Signature</Label>
          <Select
            value={part.keySignature || undefined}
            onValueChange={(value) => {
              const keySignature = value as KeySignature;
              onUpdate({ keySignature });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select key" />
            </SelectTrigger>
            <SelectContent>
              {keySignatureItems.map((key) => (
                <SelectItem key={key.value} value={key.value}>
                  {key.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Song Title</Label>
        <Input
          placeholder="Or type custom title..."
          value={part.songTitle}
          onChange={(e) =>
            onUpdate({
              songTitle: e.target.value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Notes (Optional)</Label>
        <Textarea
          placeholder="e.g., Verses 1, 2, and 4 only"
          value={part.notes || ""}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          rows={2}
        />
      </div>
    </div>
  );
}
