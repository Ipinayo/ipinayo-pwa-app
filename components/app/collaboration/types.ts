import { AccessPerson } from "@/lib/collaboration-utils";
import type { PendingInvite } from "@/types/models";
import type { ShareInput, ShareableRole } from "@/types/schemas/collaboration";

/** The server actions the collaborators manager calls, injected per entity
 *  (selection vs draft) so the UI stays entity-agnostic. */
export type CollaboratorsActions = {
  share: (input: ShareInput) => Promise<{ shared: number }>;
  changeRole: (input: {
    id: string;
    userId: string;
    role: ShareableRole;
  }) => Promise<void>;
  remove: (input: { id: string; userId: string }) => Promise<void>;
  list: (id: string) => Promise<AccessPerson[]>;
  listInvites: (id: string) => Promise<PendingInvite[]>;
  revokeInvite: (input: { id: string; invitationId: string }) => Promise<void>;
  resendInvite: (input: { id: string; invitationId: string }) => Promise<void>;
  attachGroup: (input: { id: string; groupId: string }) => Promise<void>;
  detachGroup: (input: { id: string }) => Promise<void>;
};


