import { clsx, type ClassValue } from "clsx"
import { ReadonlyURLSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge"
import { Option } from "../components/common/multiple-selector"
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { Location } from "@/types/models";

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

export const formatDate = (date: string | Date) => {
  if (!date) return '';

  return format(date, 'PPP', { locale: enGB })
};

export function getLabelForValue(
  items: { label: string; value: string }[],
  value: string | undefined,
  fallback = ""
): string {
  return items.find((item) => item.value === value)?.label ?? fallback;
}

export function transformStringsToOptions(strings: string[]): Option[] {
  return strings.map((str) => ({
    label: str,
    value: str,
  }));
}

export function getValuesFromOptions(options: Option[]) {
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