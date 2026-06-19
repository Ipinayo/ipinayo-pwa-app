import type { ShareableRole } from "@/types/schemas/collaboration";

export type UserLite = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

/** A person with access: the creator ("OWNER") or a collaborator. */
export type AccessPersonView = UserLite & {
  role: ShareableRole | "OWNER";
  isOwner: boolean;
};

/** Assignable roles, with the descriptions shown in the role picker. */
export const ROLE_OPTIONS: {
  value: ShareableRole;
  label: string;
  description: string;
}[] = [
  { value: "MANAGER", label: "Manager", description: "Can edit and manage sharing" },
  { value: "EDITOR", label: "Editor", description: "Can view and make changes" },
  { value: "COMMENTER", label: "Commenter", description: "Can view and comment" },
  { value: "VIEWER", label: "Viewer", description: "Can view only" },
];

export const ROLE_LABEL: Record<string, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  EDITOR: "Editor",
  COMMENTER: "Commenter",
  VIEWER: "Viewer",
};
