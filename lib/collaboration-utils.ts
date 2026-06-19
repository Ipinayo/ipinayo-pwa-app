import { CollaboratorRole } from "@/types/models";

/**
 * Check capabilities with `can(access, Permission.X)` so new capabilities can be added to ROLE_PERMISSIONS without
 * touching call sites. The access resolvers that read these from the DB live in `lib/actions/collaboration.ts`.
 *
 * The CREATOR is the implicit owner (no collaborator row, immutable). The
 * assignable roles are MANAGER / EDITOR / COMMENTER / VIEWER; MANAGER grants the
 * same manage capability as the owner (share, change roles, delete, promote).
 */

/** The atomic capabilities a role can grant. Extend here, not at call sites. */
export enum Permission {
  View = "view",
  /** TODO: Post comments / join the discussion. */
  Comment = "comment",
  Edit = "edit",
  Manage = "manage",
}

export type Access = {
  /** The collaborator role, or null for the creator / no access. */
  role: CollaboratorRole | null;
  /** True for the creator (implicit owner). */
  isOwner: boolean;
  /** The capabilities this access grants. Query via `can()`. */
  permissions: readonly Permission[];
};

export type AccessPerson = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: CollaboratorRole | "OWNER";
  isOwner: boolean;
};

/** A role is a named bundle of permissions. */
export const ROLE_PERMISSIONS: Record<CollaboratorRole, readonly Permission[]> = {
  MANAGER: [Permission.View, Permission.Comment, Permission.Edit, Permission.Manage],
  EDITOR: [Permission.View, Permission.Comment, Permission.Edit],
  COMMENTER: [Permission.View, Permission.Comment],
  VIEWER: [Permission.View],
};

export function getAccessForRole(role: CollaboratorRole): Access {
  return { role, isOwner: false, permissions: ROLE_PERMISSIONS[role] };
}

export const NO_ACCESS: Access = { role: null, isOwner: false, permissions: [] };

export const OWNER_ACCESS: Access = {
  role: null,
  isOwner: true,
  permissions: [Permission.View, Permission.Comment, Permission.Edit, Permission.Manage],
};

export const PUBLIC_VIEWER_ACCESS: Access = {
  role: null,
  isOwner: false,
  permissions: [Permission.View],
};

/** Whether `access` grants `permission`. The single capability check. */
export function can(access: Access, permission: Permission): boolean {
  return access.permissions.includes(permission);
}
