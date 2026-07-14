import {
  CommentsError,
  CommentsSection,
  CommentsSkeleton,
} from "@/components/app/comments/comments-section";
import { Permission, can } from "@/lib/collaboration-utils";
import { getAllPartNames, getThemes } from "@/lib/actions/mass-selections";
import {
  getDraftAccess,
  getDraftAccessPeople,
} from "@/lib/actions/collaboration";

import { AccessAvatarGroup } from "@/components/app/collaboration/access-avatar-group";
import BackButton from "@/components/common/back-button";
import CreateForm from "@/components/app/draft-selections/create-form";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { Params } from "@/types/utils";
import { Suspense } from "react";
import { getDraftById } from "@/lib/actions/draft";
import { requireAuth } from "@/lib/auth";

export default async function CreateMassSelectionPage(props: {
  params: Params;
}) {
  const params = await props.params;

  const session = await requireAuth(`/liturgical-selections/new/${params.id}`);

  const draft = await getDraftById(params.id);
  const access = await getDraftAccess(draft.id, session.user.id);
  const canEdit = can(access, Permission.Edit);
  const hasAccess = access.isOwner || access.role !== null;
  const accessPeople = hasAccess ? await getDraftAccessPeople(draft.id) : [];

  const [themes, partNames] = await Promise.all([
    getThemes(),
    getAllPartNames(),
  ]);

  return (
    <div className="mx-auto max-w-4xl w-full">
      <div className="flex flex-col items-start w-full gap-4 mb-8">
        <div className="flex items-center gap-2 justify-between w-full">
          <BackButton to="/liturgical-selections/new" />
          <div className="flex items-center gap-2">
            {hasAccess && (
              <AccessAvatarGroup
                people={accessPeople}
                hasAccess={hasAccess}
                manageHref={`/liturgical-selections/new/${draft.id}/collaborators`}
              />
            )}
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-full">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Draft
              </span>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-display text-foreground">
            Create Liturgical Selection
          </h2>
          <p className="text-muted-foreground mt-1">
            Using template:{" "}
            <span className="font-medium">
              {draft.template || "Custom Template"}
            </span>
          </p>
        </div>
      </div>

      {/* Key by updatedAt to ensure refresh */}
      <CreateForm
        key={String(draft.updatedAt)}
        themes={themes}
        partNames={partNames}
        draftSelection={draft}
        canEdit={canEdit}
      />

      {hasAccess && (
        <div className="mt-10">
          <ErrorBoundary fallback={<CommentsError />}>
            <Suspense fallback={<CommentsSkeleton />}>
              <CommentsSection
                entity="draft"
                entityId={draft.id}
                viewerId={session.user.id}
                canComment={can(access, Permission.Comment)}
                canModerate={can(access, Permission.Manage)}
                mentionables={accessPeople}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}
