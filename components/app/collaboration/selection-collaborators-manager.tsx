"use client";

import {
  attachSelectionGroup,
  detachSelectionGroup,
} from "@/lib/actions/collaborator-groups";
import {
  changeSelectionRole,
  getSelectionAccessPeople,
  getSelectionInvitations,
  removeSelectionAccess,
  resendSelectionInvitation,
  revokeSelectionInvitation,
  shareSelection,
} from "@/lib/actions/collaboration";

import { AccessPerson } from "@/lib/collaboration-utils";
import { AttachableGroup } from "@/types/models";
import type { CollaboratorsActions } from "./types";
import {
  CollaboratorsManager,
} from "./collaborators-manager";

const actions: CollaboratorsActions = {
  share: shareSelection,
  changeRole: changeSelectionRole,
  remove: removeSelectionAccess,
  list: getSelectionAccessPeople,
  listInvites: getSelectionInvitations,
  revokeInvite: revokeSelectionInvitation,
  resendInvite: resendSelectionInvitation,
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
