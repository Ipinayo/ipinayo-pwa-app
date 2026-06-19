import { Permission, can } from "@/lib/collaboration-utils";
import {
  getDraftAccess,
  getDraftAccessPeople,
} from "@/lib/actions/collaboration";

import BackButton from "@/components/common/back-button";
import { DraftCollaboratorsManager } from "@/components/app/collaboration/draft-collaboration";
import { Params } from "@/types/utils";
import { getDraftById } from "@/lib/actions/draft";
import { requireAuth } from "@/lib/auth";

export default async function DraftCollaboratorsPage(props: {
  params: Params;
}) {
  const params = await props.params;
  const session = await requireAuth(
    `/liturgical-selections/new/${params.id}/collaborators`,
  );

  const draft = await getDraftById(params.id);
  const access = await getDraftAccess(params.id, session.user.id);

  if (!access.isOwner && access.role === null) {
    throw new Error("Unauthorized");
  }

  const canManage = can(access, Permission.Manage);
  const people = await getDraftAccessPeople(params.id);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <BackButton
          to={`/liturgical-selections/new/${params.id}`}
          backText="Back to draft"
          className="justify-start"
        />
        <div>
          <h2 className="font-display text-foreground text-3xl">
            Collaborators
          </h2>
          <p className="text-muted-foreground mt-1">
            {draft.title || "Untitled draft"}
          </p>
        </div>
      </div>

      <DraftCollaboratorsManager
        id={params.id}
        canManage={canManage}
        initialPeople={people}
      />
    </div>
  );
}
