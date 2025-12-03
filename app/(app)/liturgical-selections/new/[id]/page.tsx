import { getAllPartNames, getThemes } from "@/lib/actions/mass-selections";

import BackButton from "@/components/common/back-button";
import CreateForm from "@/components/app/draft-selections/create-form";
import { Params } from "@/types/utils";
import { auth } from "@/auth";
import { getDraftById } from "@/lib/actions/draft";
import { redirect } from "next/navigation";

export default async function CreateMassSelectionPage(props: {
  params: Params;
}) {
  const session = await auth();

  if (!session?.user) redirect("/signin");

  const params = await props.params;
  const draft = await getDraftById(params.id);

  const [themes, partNames] = await Promise.all([
    getThemes(),
    getAllPartNames(),
  ]);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <BackButton to="/liturgical-selections/new" />
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

        <CreateForm
          themes={themes}
          partNames={partNames}
          draftSelection={draft}
        />
      </div>
    </div>
  );
}
