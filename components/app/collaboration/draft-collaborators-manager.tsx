"use client";

import {
  attachDraftGroup,
  detachDraftGroup,
} from "@/lib/actions/collaborator-groups";
import {
  changeDraftRole,
  getDraftAccessPeople,
  getDraftInvitations,
  removeDraftAccess,
  resendDraftInvitation,
  revokeDraftInvitation,
  shareDraft,
} from "@/lib/actions/collaboration";

import { AccessPerson } from "@/lib/collaboration-utils";
import { AttachableGroup } from "@/types/models";
import type { CollaboratorsActions } from "./types";
import { CollaboratorsManager } from "./collaborators-manager";

const actions: CollaboratorsActions = {
  share: shareDraft,
  changeRole: changeDraftRole,
  remove: removeDraftAccess,
  list: getDraftAccessPeople,
  listInvites: getDraftInvitations,
  revokeInvite: revokeDraftInvitation,
  resendInvite: resendDraftInvitation,
  attachGroup: attachDraftGroup,
  detachGroup: detachDraftGroup,
};

export function DraftCollaboratorsManager(
  props: Readonly<{
    id: string;
    canManage: boolean;
    initialPeople: AccessPerson[];
    group: { id: string; name: string | null };
    attachableGroups?: AttachableGroup[];
  }>,
) {
  return (
    <CollaboratorsManager entityLabel="draft" actions={actions} {...props} />
  );
}
