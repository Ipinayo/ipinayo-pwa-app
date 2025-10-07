import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDate } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

export default function DateSelect({
  value,
  onChange,
}: {
  value?: Date;
  onChange?: (date: Date) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full pl-3 text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {value ? formatDate(value) : <span>Pick a date</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          endMonth={undefined}
          required
        />
      </PopoverContent>
    </Popover>
  );
}
