import { Permission, can } from "@/lib/collaboration-utils";
import {
  getSelectionAccess,
  getSelectionAccessPeople,
  getSelectionGroupContext,
} from "@/lib/actions/collaboration";

import BackButton from "@/components/common/back-button";
import { Params } from "@/types/utils";
import { SelectionCollaboratorsManager } from "@/components/app/collaboration/selection-collaborators-manager";
import { getSelectionById } from "@/lib/actions/mass-selections";
import { requireAuth } from "@/lib/auth";

export default async function SelectionCollaboratorsPage(props: {
  params: Params;
}) {
  const params = await props.params;
  const session = await requireAuth(
    `/liturgical-selections/${params.id}/collaborators`,
  );

  const selection = await getSelectionById(params.id);
  const access = await getSelectionAccess(params.id, session.user.id);

  // Only people with real access (owner or collaborator) can see this page.
  if (!access.isOwner && access.role === null) {
    throw new Error("Unauthorized");
  }

  const canManage = can(access, Permission.Manage);
  const [people, groupContext] = await Promise.all([
    getSelectionAccessPeople(params.id),
    getSelectionGroupContext(params.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <BackButton
          to={`/liturgical-selections/${params.id}`}
          backText="Back"
          className="justify-start"
        />
        <div>
          <h2 className="font-display text-foreground text-3xl">
            Collaborators
          </h2>
          <p className="text-muted-foreground mt-1">{selection.title}</p>
        </div>
      </div>

      <SelectionCollaboratorsManager
        id={params.id}
        canManage={canManage}
        initialPeople={people}
        group={groupContext?.group ?? { id: "", name: null }}
        attachableGroups={groupContext?.attachableGroups ?? []}
      />
    </div>
  );
}
