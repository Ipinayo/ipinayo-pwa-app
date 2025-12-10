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
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
          <div className="flex items-end gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-full">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Draft
              </span>
            </div>
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
