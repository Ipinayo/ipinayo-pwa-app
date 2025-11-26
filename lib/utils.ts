import { clsx, type ClassValue } from "clsx"
import { ReadonlyURLSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge"
import { enGB } from "date-fns/locale";
import { formatInTimeZone } from 'date-fns-tz';
import { Location } from "@/types/models";
import { SelectOption } from "@/types/components/select";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const createQueryString = (
  updates: Record<string, string>,
  searchParams: ReadonlyURLSearchParams
) => {
  const params = new URLSearchParams(searchParams);
  Object.entries(updates).forEach(([key, value]) => {
    params.set(key, value);
  });
  return params.toString();
};

export function getEnumByValue<T extends Record<string, string>>(
  enumObj: T,
  value: string
): T[keyof T] | undefined {
  return Object.values(enumObj).includes(value as T[keyof T])
    ? value as T[keyof T]
    : undefined;
}

export function getEnumByKey<T extends Record<string, string>>(
  enumObj: T,
  key: string
): T[keyof T] | undefined {
  return key in enumObj ? enumObj[key as keyof T] : undefined;
}

export function getEnum<T extends Record<string, string>>(
  enumObj: T,
  val: string
): T[keyof T] | undefined {

  if (Object.values(enumObj).includes(val as T[keyof T])) {
    // match by value
    return val as T[keyof T];
  }

  if (val in enumObj) {
    // match by key
    return enumObj[val as keyof T];
  }

  return undefined;
}

export function getLabelForValue(
  items: { label: string; value: string }[],
  value: string | undefined,
  fallback = ""
): string {
  return items.find((item) => item.value === value)?.label ?? fallback;
}

/**
 * Flattens a recursive category structure into flat Option[] with group info.
 *
 * @param data - List of top-level data
 * @param valueKey - Key to use as the option value (e.g. "id")
 * @param labelKey - Key to use as the option label (e.g. "name")
 * @param childrenKey - Key holding nested children (e.g. "children")
 * @returns SelectOption[] flattened with group name
 */
export function transformToGroupedOptions<T extends Record<string, any>>(
  data: T[],
  valueKey: keyof T,
  labelKey: keyof T,
  childrenKey: keyof T
): SelectOption[] {
  const result: SelectOption[] = [];

  const recurse = (parent: T) => {
    const children = parent[childrenKey] as Set<T> | T[] | undefined;
    if (!children) return;

    for (const child of Array.from(children)) {
      result.push({
        label: String(child[labelKey]),
        value: child[valueKey],
        group: String(parent[labelKey]), // group by parent name
      });

      recurse(child); // go deeper if the child has its own children
    }
  };

  for (const parent of data) {
    recurse(parent);
  }

  return result;
}

export function transformStringsToOptions(strings: string[]): SelectOption[] {
  return strings.map((str) => ({
    label: str,
    value: str,
  }));
}

export function transformObjectToOptions<T extends Record<string, any>>(
  data: T[],
  valueKey: keyof T,
  labelKey: keyof T
): SelectOption[] {
  return data.map((item) => ({
    label: String(item[labelKey]),
    value: item[valueKey],
  }));
}

export function getValuesFromOptions(options: SelectOption[]) {
  return options.map((opt) => opt.value)
}

export function capitalize(sentence: string): string {
  if (!sentence) {
    return "";
  }

  return sentence
    .split(" ")
    .map((word: string) => {
      if (word.length === 0) {
        return "";
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function formatParishInfo(location: Location | null | undefined, parishName: string | null | undefined): string {
  const parts: string[] = []

  if (parishName) {
    parts.push(parishName)
  }

  if (location) {
    if (location.city) {
      parts.push(location.city)
    }
    if (location.state) {
      parts.push(location.state)
    }
    if (location.country) {
      parts.push(location.country)
    }
  }

  return parts.length > 0 ? parts.join(", ") : "Unknown Parish"
}

export function convertToLowerCase(str: string[]): string[] {
  return str.map(s => s.toLowerCase());
}

export function getFieldError(err: any): string {
  if (!Array.isArray(err)) return err?.message ?? '';
  const first = err.find(item => item && item.message);
  return first?.message ?? '';
}

// Date formatting utilities

/**
 * Formats timestamps in user's timezone (for createdAt/updatedAt)
 * @param date 
 * @returns date string in PPP format
 */
export const formatDate = (date: string | Date) => {
  if (!date) return '';

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Browser timezone

  return formatInTimeZone(date, userTimezone, 'PPP', { locale: enGB })
};

/** 
 * Formats calendar dates in UTC (for liturgical selection dates)
 * @param date 
 * @returns date string in PPP format
 */
export const formatCalendarDate = (date: string | Date) => {
  if (!date) return '';

  return formatInTimeZone(date, 'UTC', 'PPP', { locale: enGB });
};

/**
 * Normalizes dates to UTC midnight before database storage
 * @param date 
 * @returns date at UTC midnight
 */
export function normalizeDate(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}
