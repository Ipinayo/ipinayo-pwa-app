"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AppFilter({
  items,
  selected,
  onSelected,
}: {
  selected: string;
  items: { label: string; value: string }[] | string[];
  onSelected: (value: string) => void;
}) {
  return (
    <Select value={selected} onValueChange={(value) => onSelected(value)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => {
          const value = typeof item === "string" ? item : item.value;
          const label = typeof item === "string" ? item : item.label;
          return (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
