import { clsx, type ClassValue } from "clsx"
import { ReadonlyURLSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge"
import { enGB } from "date-fns/locale";
import { formatInTimeZone } from 'date-fns-tz';
import { Json, Location, UserRole } from "@/types/models";
import { SelectOption } from "@/types/components/select";
import { formatDistanceToNow } from "date-fns";
import { ActivityEventMap } from "@/types/utils";


type EventMeta<K extends keyof ActivityEventMap> = ActivityEventMap[K]["metadata"];

/** Per-event value: a static string or a builder from the metadata. Typed as a
 *  full mapped type so adding an event forces an entry in each map below. */
type EventText = {
  [K in keyof ActivityEventMap]: string | ((m: EventMeta<K>) => string);
};

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

export function isFeaturedAuthor(
  userRole: UserRole | null | undefined,
): boolean {
  return userRole === UserRole.FEATURED_AUTHOR;
}

/**
 * The current calendar week as a Monday→Sunday range, BOTH ends inclusive.
 */
export function getCurrentWeekRange(now: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const daysSinceMonday = (now.getDay() + 6) % 7;

  const monday = new Date(now);
  monday.setDate(now.getDate() - daysSinceMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const start = new Date(
    Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate()),
  );
  const end = new Date(
    Date.UTC(sunday.getFullYear(), sunday.getMonth(), sunday.getDate()),
  );

  return { start, end };
}

export function isDateInCurrentWeek(date: Date | string): boolean {
  const { start, end } = getCurrentWeekRange();
  const d = new Date(date);
  return d >= start && d <= end;
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

const ACTIVITY_ENTITY: EventText = {
  "selection.created_by_self": (m) => m.title,
  "selection.cloned_by_self": (m) => m.title,
  "selection.cloned_by_other": (m) => m.title,
  "selection.updated_by_self": (m) => m.title,
  "selection.deleted_by_self": (m) => m.title,
  "selection.deleted_by_other": (m) => m.title,
  "selection.shared_with_other": (m) => m.title,
  "selection.shared_by_other": (m) => m.title,
  "selection.shared_by_self": (m) => m.title,
  "selection.role_updated": (m) => m.title,
  "selection.updated_by_other": (m) => m.title,
  "selection.access_revoked": (m) => m.title,
  "draft.access_revoked": (m) => m.title,
  "draft.shared_with_other": (m) => m.title,
  "draft.shared_by_other": (m) => m.title,
  "draft.shared_by_self": (m) => m.title,
  "draft.role_updated": (m) => m.title,
  "draft.updated_by_other": (m) => m.title,
  "draft.updated_by_self": (m) => m.title,
  "draft.deleted_by_self": (m) => m.title,
  "draft.deleted_by_other": (m) => m.title,
  "draft.expired": (m) => m.title,
  "draft.expiring": (m) => m.title,
  "draft.created_by_self": "New Draft",
  "collaboration.added_to_group": (m) => m.groupName,
  "collaboration.removed_from_group": (m) => m.groupName,
  "collaboration.left_group": (m) => m.groupName,
  "collaboration.left_group_by_self": (m) => m.groupName,
  "collaboration.group_created_by_self": (m) => m.groupName,
  "collaboration.group_deleted_by_self": (m) => m.groupName,
  "collaboration.group_role_updated": (m) => m.groupName,
  "user.registered": (m) => m.name,
  "user.updated": "Your profile",
  "system.announcement": (m) => m.title,
  "system.maintenance": (m) => m.title,
};

export function getActivityEntity(event: string, metadata: Json) {
  const entry = (ACTIVITY_ENTITY as Record<string, string | ((m: any) => string)>)[event];
  if (entry === undefined) return "";
  return typeof entry === "function" ? entry(metadata) : entry;
}

/** The activity-feed heading. Admins see a third-person variant of some events. */
const ACTIVITY_EVENT: {
  [K in keyof ActivityEventMap]: string | ((admin: boolean) => string);
} = {
  "selection.created_by_self": "New selection",
  "selection.cloned_by_self": "Selection cloned",
  "selection.cloned_by_other": (admin) => admin ? "Selection cloned by another user" : "Your selection was cloned",
  "selection.updated_by_self": "Selection updated",
  "selection.deleted_by_self": "Selection deleted",
  "selection.shared_with_other": (admin) => admin ? "Selection shared with a user" : "A selection was shared with you",
  "selection.shared_by_other": (admin) => admin ? "Selection was shared by another user" : "Your selection was shared",
  "selection.shared_by_self": (admin) => admin ? "Selection shared" : "You shared a selection",
  "selection.role_updated": (admin) => admin ? "Selection access changed" : "Your access changed",
  "selection.updated_by_other": (admin) => admin ? "Shared selection updated" : "A shared selection was updated",
  "selection.deleted_by_other": (admin) => admin ? "Shared selection deleted" : "A shared selection was deleted",
  "selection.access_revoked": "Your access was removed",
  "draft.access_revoked": "Your access was removed",
  "draft.shared_with_other": (admin) => admin ? "Draft shared with a user" : "A draft was shared with you",
  "draft.shared_by_other": (admin) => admin ? "Draft was shared by another user" : "Your draft was shared",
  "draft.shared_by_self": (admin) => admin ? "Draft shared" : "You shared a draft",
  "draft.role_updated": (admin) => admin ? "Draft access changed" : "Your access changed",
  "draft.updated_by_other": (admin) => admin ? "Shared draft updated" : "A shared draft was updated",
  "user.registered": "Profile created",
  "user.updated": "Profile updated",
  "draft.created_by_self": "New draft created",
  "draft.updated_by_self": "Draft updated",
  "draft.deleted_by_other": (admin) => admin ? "Draft deleted by another user" : "Your draft was deleted",
  "draft.deleted_by_self": "Draft deleted",
  "draft.expired": "Draft expired",
  "draft.expiring": "Draft expiring soon",
  "collaboration.added_to_group": (admin) => admin ? "User added to a group" : "You were added to a group",
  "collaboration.removed_from_group": (admin) => admin ? "User removed from a group" : "You were removed from a group",
  "collaboration.left_group": (admin) => admin ? "Member left a group" : "A member left your group",
  "collaboration.left_group_by_self": (admin) => admin ? "Member left a group" : "You left a group",
  "collaboration.group_created_by_self": "Group created",
  "collaboration.group_deleted_by_self": "Group deleted",
  "collaboration.group_role_updated": (admin) => admin ? "Group role changed" : "Your group role changed",
  "system.announcement": "Announcement",
  "system.maintenance": "System maintenance",
};

export function getActivityEvent(event: string, admin = false): string {
  const entry = (ACTIVITY_EVENT as Record<string, string | ((admin: boolean) => string)>)[event];
  if (entry === undefined) return "New activity";
  return typeof entry === "function" ? entry(admin) : entry;
}