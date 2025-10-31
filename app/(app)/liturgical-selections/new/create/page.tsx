import BackButton from "@/components/common/back-button";
import SaveForm from "@/components/app/mass-selections/save-form";
import { SearchParams } from "@/types/utils";
import { auth } from "@/auth";
import { getThemes } from "@/lib/actions/mass-selections";
import { liturgyTemplates } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function CreateMassSelectionPage(props: {
  searchParams: SearchParams;
}) {
  const session = await auth();

  if (!session?.user) redirect("/signin");

  const searchParams = await props.searchParams;
  const template = searchParams["template"] || "blank";

  const themes = await getThemes();

  const templateName =
    liturgyTemplates.find((temp) => temp.id === template)?.name ||
    "Custom Template";

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <BackButton
            to="/liturgical-selections/new"
            backText="Back to Templates"
          />
          <div>
            <h2 className="text-3xl font-display text-foreground">
              Create Liturgical Selection
            </h2>
            <p className="text-muted-foreground mt-1">
              Using template:{" "}
              <span className="font-medium">{templateName}</span>
            </p>
          </div>
        </div>

        <SaveForm mode="create" template={template} themes={themes} />
      </div>
    </div>
  );
}
