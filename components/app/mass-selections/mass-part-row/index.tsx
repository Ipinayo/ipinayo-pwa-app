"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CSS } from "@dnd-kit/utilities";
import { Control } from "react-hook-form";
import { MassPartForm } from "./mass-part-form";
import { NewMassSelection } from "@/types/models";
import { SelectOption } from "@/types/components/select";
import { useSortable } from "@dnd-kit/sortable";

interface MassPartRowProps {
  partId: string;
  control: Control<NewMassSelection>;
  index: number;
  canRemove: boolean;
  partNames: SelectOption[];
  onRemove: () => void;
  onInsertPart: () => void;
}

export default function MassPartRow({
  partId,
  control,
  index,
  canRemove,
  partNames,
  onRemove,
  onInsertPart,
}: MassPartRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: partId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-2">
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
        {/* Part Content */}
        <div
          className="flex-1 min-w-0 cursor-grab active:cursor-grabbing transition-colors shrink-0"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          <MassPartForm control={control} index={index} partNames={partNames} />
        </div>

        {/* Delete Button  */}
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 h-9 w-9 p-0"
            title="Delete part"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex justify-end pl-10 sm:pl-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={onInsertPart}
          className="text-xs h-7 px-2 transition-colors"
        >
          <Plus className="h-3 w-3 mr-1" />
          Insert Part
        </Button>
      </div>
    </div>
  );
}
