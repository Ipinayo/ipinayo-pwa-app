import { getAllPartNames, getThemes } from "@/lib/actions/mass-selections";

import BackButton from "@/components/common/back-button";
import SaveForm from "@/components/app/mass-selections/save-form";
import { SearchParams } from "@/types/utils";
import { auth } from "@/auth";
import { getUserParishAndChoirInfo } from "@/lib/actions/user";
import { liturgyTemplates } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function CreateMassSelectionPage(props: {
  searchParams: SearchParams;
}) {
  const session = await auth();

  if (!session?.user) redirect("/signin");

  const searchParams = await props.searchParams;
  const template = searchParams["template"] || "blank";

  const [themes, parishLocation, partNames] = await Promise.all([
    getThemes(),
    getUserParishAndChoirInfo(),
    getAllPartNames(),
  ]);

  const templateName =
    liturgyTemplates.find((temp) => temp.id === template)?.name ||
    "Custom Template";

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
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

        <SaveForm
          mode="create"
          template={template}
          themes={themes}
          parishLocation={parishLocation?.parishLocation || null}
          choirName={parishLocation?.choirName || null}
          parishName={parishLocation?.parishName || null}
          partNames={partNames}
        />
      </div>
    </div>
  );
}
