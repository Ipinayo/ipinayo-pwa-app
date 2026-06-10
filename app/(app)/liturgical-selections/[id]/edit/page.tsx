import {
  getAllPartNames,
  getSelectionById,
  getThemes,
} from "@/lib/actions/mass-selections";

import BackButton from "@/components/common/back-button";
import EditForm from "@/components/app/mass-selections/edit-selection";
import { Params } from "@/types/utils";
import { PushNotificationPrompt } from "@/components/push-notification-prompt";
import { requireAuth } from "@/lib/auth";

export default async function EditPage(props: { params: Params }) {
  const params = await props.params;

  const session = await requireAuth(`/liturgical-selections/${params.id}/edit`);

  const selection = await getSelectionById(params.id);

  if (selection.createdById !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const [themes, partNames] = await Promise.all([
    getThemes(),
    getAllPartNames(),
  ]);

  return (
    <div className="mx-auto max-w-4xl w-full">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <BackButton
          to={`/liturgical-selections/${params.id}`}
          backText="Back to View"
        />
        <div>
          <h2 className="text-3xl font-display text-foreground">
            Edit: {selection.title}
          </h2>
          <p className="text-muted-foreground mt-1">
            Make changes to your Liturgical selection
          </p>
        </div>
      </div>

      {/* Key by updatedAt to ensure refresh */}
      <EditForm
        key={String(selection.updatedAt)}
        selection={selection}
        themes={themes}
        partNames={partNames}
      />

      <PushNotificationPrompt />
    </div>
  );
}
