import { clsx, type ClassValue } from "clsx"
import { ReadonlyURLSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge"
import { enGB } from "date-fns/locale";
import { formatInTimeZone } from 'date-fns-tz';
import { Json, Location, UserRole } from "@/types/models";
import { SelectOption } from "@/types/components/select";
import { formatDistanceToNow } from "date-fns";
import { ActivityEventMap } from "@/types/utils";

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
  const first = err.find(item => item?.message);
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
export function normalizeDate(date: Date | null | undefined) {
  if (!date) return new Date();
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function formatDateFromNow(date: string | Date): string {
  if (!date) return '';

  return formatDistanceToNow(date, { addSuffix: true, locale: enGB });
}

export function isAdmin(userRole: UserRole | null | undefined): boolean {
  return userRole === UserRole.ADMIN || userRole === UserRole.SUPERADMIN;
}

export function stringToBoolean(str: string | undefined | null): boolean | undefined {

  const value = str?.toLowerCase();

  if (value === "true") return true;
  if (value === "false") return false;

  return undefined;
}

export function getCallbackUrl(path: string, filters: {
  [key: string]: string | undefined;
}): string {
  const searchParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
    ) as Record<string, string>
  );

  return path + (searchParams.toString() ? `?${searchParams.toString()}` : "");
}

export function getActivityEntity(
  event: string,
  metadata: Json
) {
  switch (event) {
    case "selection.created_by_self":
      {
        const data = metadata as ActivityEventMap["selection.created_by_self"]["metadata"];
        return `${data.title}`;
      }
    case "selection.cloned_by_self":
      {
        const data = metadata as ActivityEventMap["selection.cloned_by_self"]["metadata"];
        return `${data.title}`;
      }
    case "selection.cloned_by_other":
      {
        const data = metadata as ActivityEventMap["selection.cloned_by_other"]["metadata"];
        return `${data.title}`;
      }
    case "selection.updated_by_self":
      {
        const data = metadata as ActivityEventMap["selection.updated_by_self"]["metadata"];
        return `${data.title}`;
      }
    case "selection.deleted_by_self":
      {
        const data = metadata as ActivityEventMap["selection.deleted_by_self"]["metadata"];
        return `${data.title}`;
      }
    case "selection.shared_with_other":
      {
        const data = metadata as ActivityEventMap["selection.shared_with_other"]["metadata"];
        return `${data.title}`;
      }
    case "selection.shared_by_other":
      {
        const data = metadata as ActivityEventMap["selection.shared_by_other"]["metadata"];
        return `${data.title}`;
      }
    case "selection.shared_by_self":
      {
        const data = metadata as ActivityEventMap["selection.shared_by_self"]["metadata"];
        return `${data.title}`;
      }
    case "selection.role_updated":
      {
        const data = metadata as ActivityEventMap["selection.role_updated"]["metadata"];
        return `${data.title}`;
      }
    case "selection.updated_by_other":
      {
        const data = metadata as ActivityEventMap["selection.updated_by_other"]["metadata"];
        return `${data.title}`;
      }
    case "selection.deleted_by_other":
      {
        const data = metadata as ActivityEventMap["selection.deleted_by_other"]["metadata"];
        return `${data.title}`;
      }
    case "selection.access_revoked":
      {
        const data = metadata as ActivityEventMap["selection.access_revoked"]["metadata"];
        return `${data.title}`;
      }
    case "draft.access_revoked":
      {
        const data = metadata as ActivityEventMap["draft.access_revoked"]["metadata"];
        return `${data.title}`;
      }
    case "draft.shared_with_other":
      {
        const data = metadata as ActivityEventMap["draft.shared_with_other"]["metadata"];
        return `${data.title}`;
      }
    case "draft.shared_by_other":
      {
        const data = metadata as ActivityEventMap["draft.shared_by_other"]["metadata"];
        return `${data.title}`;
      }
    case "draft.shared_by_self":
      {
        const data = metadata as ActivityEventMap["draft.shared_by_self"]["metadata"];
        return `${data.title}`;
      }
    case "draft.role_updated":
      {
        const data = metadata as ActivityEventMap["draft.role_updated"]["metadata"];
        return `${data.title}`;
      }
    case "draft.updated_by_other":
      {
        const data = metadata as ActivityEventMap["draft.updated_by_other"]["metadata"];
        return `${data.title}`;
      }
    case "user.registered":
      {
        const data = metadata as ActivityEventMap["user.registered"]["metadata"];
        return `${data.name}`;
      }
    case "user.updated":
      return `Your profile`;
    case "draft.created_by_self":
      return `New Draft`;
    case "draft.updated_by_self":
      {
        const data = metadata as ActivityEventMap["draft.updated_by_self"]["metadata"];
        return `${data.title}`;
      }
    case "draft.deleted_by_self":
      {
        const data = metadata as ActivityEventMap["draft.deleted_by_self"]["metadata"];
        return `${data.title}`;
      }
    case "draft.deleted_by_other":
      {
        const data = metadata as ActivityEventMap["draft.deleted_by_other"]["metadata"];
        return `${data.title}`;
      }
    case "draft.expired":
      {
        const data = metadata as ActivityEventMap["draft.expired"]["metadata"];
        return `${data.title}`;
      }
    case "draft.expiring":
      {
        const data = metadata as ActivityEventMap["draft.expiring"]["metadata"];
        return `${data.title}`;
      }
    case "system.announcement":
      {
        const data = metadata as ActivityEventMap["system.announcement"]["metadata"];
        return `${data.title}`;
      }
    case "system.maintenance":
      {
        const data = metadata as ActivityEventMap["system.maintenance"]["metadata"];
        return `${data.title}`;
      }

    default:
      return "";
  }
}

export function getActivityEvent(event: string, admin?: boolean): string {
  switch (event) {
    case "selection.created_by_self":
      return `New selection`;
    case "selection.cloned_by_self":
      return `Selection cloned`;
    case "selection.cloned_by_other":
      return admin ? `Selection cloned by another user` : `Your selection was cloned`;
    case "selection.updated_by_self":
      return `Selection updated`;
    case "selection.deleted_by_self":
      return `Selection deleted`;
    case "selection.shared_with_other":
      return admin ? `Selection shared with a user` : `A selection was shared with you`;
    case "selection.shared_by_other":
      return admin ? `Selection was shared by another user` : `Your selection was shared`;
    case "selection.shared_by_self":
      return admin ? `Selection shared` : `You shared a selection`;
    case "selection.role_updated":
      return admin ? `Selection access changed` : `Your access changed`;
    case "selection.updated_by_other":
      return admin ? `Shared selection updated` : `A shared selection was updated`;
    case "selection.deleted_by_other":
      return admin ? `Shared selection deleted` : `A shared selection was deleted`;
    case "selection.access_revoked":
    case "draft.access_revoked":
      return `Your access was removed`;
    case "draft.shared_with_other":
      return admin ? `Draft shared with a user` : `A draft was shared with you`;
    case "draft.shared_by_other":
      return admin ? `Draft was shared by another user` : `Your draft was shared`;
    case "draft.shared_by_self":
      return admin ? `Draft shared` : `You shared a draft`;
    case "draft.role_updated":
      return admin ? `Draft access changed` : `Your access changed`;
    case "draft.updated_by_other":
      return admin ? `Shared draft updated` : `A shared draft was updated`;
    case "user.registered":
      return `Profile created`;
    case "user.updated":
      return `Profile updated`;
    case "draft.created_by_self":
      return `New draft created`;
    case "draft.updated_by_self":
      return `Draft updated`;
    case "draft.deleted_by_other":
      return admin ? `Draft deleted by another user` : `Your draft was deleted`;
    case "draft.deleted_by_self":
      return `Draft deleted`;
    case "draft.expired":
      return `Draft expired`;
    case "draft.expiring":
      return `Draft expiring soon`;
    case "system.announcement":
      return `Announcement`;
    case "system.maintenance":
      return `System maintenance`;
    default:
      return "New activity";
  }
}