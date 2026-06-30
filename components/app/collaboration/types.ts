import { AccessPerson } from "@/lib/collaboration-utils";
import type { ShareableRole } from "@/types/schemas/collaboration";

/** The server actions the collaborators manager calls, injected per entity
 *  (selection vs draft) so the UI stays entity-agnostic. */
export type CollaboratorsActions = {
  share: (input: {
    id: string;
    recipients: { userId: string; role: ShareableRole }[];
    message?: string;
  }) => Promise<{ shared: number }>;
  changeRole: (input: {
    id: string;
    userId: string;
    role: ShareableRole;
  }) => Promise<void>;
  remove: (input: { id: string; userId: string }) => Promise<void>;
  list: (id: string) => Promise<AccessPerson[]>;
  attachGroup: (input: { id: string; groupId: string }) => Promise<void>;
  detachGroup: (input: { id: string }) => Promise<void>;
};


