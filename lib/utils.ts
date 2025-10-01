import { clsx, type ClassValue } from "clsx"
import { ReadonlyURLSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge"

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

