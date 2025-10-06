"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { forwardRef, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disable?: boolean;
}

interface GroupOption {
  [key: string]: SelectOption[];
}

interface CreatableSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options?: SelectOption[];
  placeholder?: string;
  emptyIndicator?: React.ReactNode;
  disabled?: boolean;
  groupBy?: string;
  className?: string;
  dropdownClassName?: string;
  creatable?: boolean;
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    "value" | "placeholder" | "disabled"
  >;
}

/**
 * Custom CommandEmpty that works correctly with cmdk
 */
const CommandEmpty = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Empty>
>(({ className, ...props }, forwardedRef) => {
  const render = useCommandState((state) => state.filtered.count === 0);

  if (!render) return null;

  return (
    <div
      ref={forwardedRef}
      className={cn("py-6 text-center text-sm", className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
});

CommandEmpty.displayName = "CommandEmpty";

function transToGroupOption(options: SelectOption[], groupBy?: string) {
  if (options.length === 0) {
    return {};
  }
  if (!groupBy) {
    return {
      "": options,
    };
  }

  const groupOption: GroupOption = {};
  options.forEach((option) => {
    const key = (option[groupBy as keyof SelectOption] as string) || "";
    if (!groupOption[key]) {
      groupOption[key] = [];
    }
    groupOption[key].push(option);
  });
  return groupOption;
}

export default function CreatableSelect({
  value,
  onValueChange,
  options = [],
  placeholder = "Select or type...",
  emptyIndicator = "",
  disabled = false,
  groupBy,
  className,
  dropdownClassName,
  creatable = true,
  commandProps,
  inputProps,
}: CreatableSelectProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [onScrollbar, setOnScrollbar] = useState(false);

  const groupedOptions = transToGroupOption(options, groupBy);

  // Find the selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Sync input value with selected option when dropdown is closed
  useEffect(() => {
    if (!open) {
      setInputValue(selectedOption?.label || value || "");
    }
  }, [open, selectedOption, value]);

  const handleClickOutside = (event: MouseEvent | TouchEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchend", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input && e.key === "Escape") {
      input.blur();
      setOpen(false);
    }
  };

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setInputValue(
      options.find((opt) => opt.value === selectedValue)?.label || selectedValue
    );
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleCreateCustom = () => {
    if (inputValue.trim()) {
      onValueChange(inputValue.trim());
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  // Check if the input value matches any existing option
  const isExactMatch = options.some(
    (opt) => opt.label.toLowerCase() === inputValue.toLowerCase()
  );

  // Filter options based on input
  const filteredOptions: GroupOption = {};
  Object.entries(groupedOptions).forEach(([key, opts]) => {
    const filtered = opts.filter((opt) =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    if (filtered.length > 0) {
      filteredOptions[key] = filtered;
    }
  });

  const hasFilteredOptions = Object.keys(filteredOptions).length > 0;
  const showCreateButton =
    creatable && inputValue.trim() && !isExactMatch && value !== inputValue;

  return (
    <Command
      ref={dropdownRef}
      {...commandProps}
      onKeyDown={(e) => {
        handleKeyDown(e);
        commandProps?.onKeyDown?.(e);
      }}
      className={cn(
        "h-auto overflow-visible dark:bg-input/30 bg-transparent",
        commandProps?.className
      )}
      shouldFilter={false}
    >
      <div
        className={cn(
          "border-input ring-offset-background focus-within:ring-ring flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={() => {
          if (disabled) return;
          inputRef?.current?.focus();
        }}
      >
        <div className="relative flex w-full items-center">
          <CommandPrimitive.Input
            {...inputProps}
            ref={inputRef}
            value={inputValue}
            disabled={disabled}
            onValueChange={(val) => {
              setInputValue(val);
              inputProps?.onValueChange?.(val);
            }}
            onBlur={(event) => {
              if (!onScrollbar) {
                setOpen(false);
              }
              inputProps?.onBlur?.(event);
            }}
            onFocus={(event) => {
              setOpen(true);
              inputProps?.onFocus?.(event);
            }}
            placeholder={placeholder}
            className={cn(
              "placeholder:text-muted-foreground flex-1 bg-transparent outline-none",
              inputProps?.className
            )}
          />
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </div>
      </div>

      <div className="relative">
        {open && (
          <CommandList
            className="bg-popover text-popover-foreground animate-in absolute top-1 z-10 w-full rounded-md border shadow-md outline-none"
            onMouseLeave={() => setOnScrollbar(false)}
            onMouseEnter={() => setOnScrollbar(true)}
            onMouseUp={() => inputRef?.current?.focus()}
          >
            {!hasFilteredOptions && !showCreateButton && (
              <div>{emptyIndicator}</div>
            )}

            {hasFilteredOptions &&
              Object.entries(filteredOptions).map(([key, opts]) => (
                <CommandGroup
                  key={key}
                  heading={key}
                  className="h-full overflow-auto"
                >
                  {opts.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      disabled={option.disable}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => handleSelect(option.value)}
                      className={cn(
                        "cursor-pointer",
                        dropdownClassName,
                        option.disable && "text-muted-foreground cursor-default"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}

            {showCreateButton && (
              <CommandGroup>
                <CommandItem
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onSelect={handleCreateCustom}
                  className="cursor-pointer text-primary"
                >
                  Use "{inputValue}"
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        )}
      </div>
    </Command>
  );
}
