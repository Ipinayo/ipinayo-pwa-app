"use client";

import {
  attachSelectionGroup,
  detachSelectionGroup,
} from "@/lib/actions/collaborator-groups";
import {
  changeSelectionRole,
  getSelectionAccessPeople,
  removeSelectionAccess,
  shareSelection,
} from "@/lib/actions/collaboration";

import { AccessPerson } from "@/lib/collaboration-utils";
import { AttachableGroup } from "@/types/models";
import {
  CollaboratorsManager,
} from "./collaborators-manager";

const actions = {
  share: shareSelection,
  changeRole: changeSelectionRole,
  remove: removeSelectionAccess,
  list: getSelectionAccessPeople,
  attachGroup: attachSelectionGroup,
  detachGroup: detachSelectionGroup,
};

export function SelectionCollaboratorsManager(
  props: Readonly<{
    id: string;
    canManage: boolean;
    initialPeople: AccessPerson[];
    group: { id: string; name: string | null };
    attachableGroups?: AttachableGroup[];
  }>,
) {
  return (
    <CollaboratorsManager
      entityLabel="selection"
      actions={actions}
      {...props}
    />
  );
}
