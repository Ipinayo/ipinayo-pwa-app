"use client";

import {
  changeSelectionRole,
  getSelectionAccessPeople,
  removeSelectionAccess,
  searchUsers,
  shareSelection,
} from "@/lib/actions/collaboration";

import type { AccessPersonView } from "./shared";
import { CollaboratorsManager } from "./collaborators-manager";

const actions = {
  search: searchUsers,
  share: shareSelection,
  changeRole: changeSelectionRole,
  remove: removeSelectionAccess,
  list: getSelectionAccessPeople,
};

export function SelectionCollaboratorsManager(
  props: Readonly<{
    id: string;
    canManage: boolean;
    initialPeople: AccessPersonView[];
  }>,
) {
  return (
    <CollaboratorsManager entityLabel="selection" actions={actions} {...props} />
  );
}
