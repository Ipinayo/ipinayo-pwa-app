import { getSelectionById, getThemes } from "@/lib/actions/mass-selections";

import BackButton from "@/components/common/back-button";
import { Params } from "@/types/utils";
import SaveForm from "@/components/app/mass-selections/save-form";
import { auth } from "@/auth";

export default async function EditPage(props: { params: Params }) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const selection = await getSelectionById(params.id);

  if (selection.createdById !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const themes = await getThemes();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <BackButton
          to={`/mass-selections/${params.id}`}
          backText="Back to View"
        />
        <div>
          <h2 className="text-3xl font-display text-foreground">
            Edit: {selection.title}
          </h2>
          <p className="text-muted-foreground mt-1">
            Make changes to your Mass selection
          </p>
        </div>
      </div>

      <SaveForm mode="edit" selection={selection} themes={themes} />
    </div>
  );
}
