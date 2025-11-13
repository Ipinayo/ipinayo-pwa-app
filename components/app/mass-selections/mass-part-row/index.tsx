"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";

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
    <div ref={setNodeRef} style={style} className="space-y-1">
      <div className="flex gap-3 flex-col sm:flex-row">
        {/* Grip Handle */}
        <div
          className="flex items-start pt-3 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors shrink-0"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>

        {/* Part Content */}
        <div className="flex-1 min-w-0">
          <MassPartForm control={control} index={index} partNames={partNames} />
        </div>
      </div>

      <div className="flex w-full gap-3 justify-between has-[>:only-child]:justify-end px-0 sm:px-10">
        {/* Delete Button  */}
        {canRemove && (
          <div className="flex">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-7 px-2 transition-colors"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete Part
            </Button>
          </div>
        )}

        <div className="flex">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onInsertPart}
            className="text-xs h-7 px-2 transition-colors"
          >
            <Plus className="h-3 w-3 mr-1" />
            Insert New Part
          </Button>
        </div>
      </div>
    </div>
  );
}
