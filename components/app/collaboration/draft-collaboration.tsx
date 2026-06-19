"use client";

import {
  changeDraftRole,
  getDraftAccessPeople,
  removeDraftAccess,
  searchUsers,
  shareDraft,
} from "@/lib/actions/collaboration";

import type { AccessPersonView } from "./shared";
import { CollaboratorsManager } from "./collaborators-manager";

const actions = {
  search: searchUsers,
  share: shareDraft,
  changeRole: changeDraftRole,
  remove: removeDraftAccess,
  list: getDraftAccessPeople,
};

export function DraftCollaboratorsManager(
  props: Readonly<{
    id: string;
    canManage: boolean;
    initialPeople: AccessPersonView[];
  }>,
) {
  return (
    <CollaboratorsManager entityLabel="draft" actions={actions} {...props} />
  );
}
