import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SaveForm from "@/components/app/mass-selections/save-form";
import { SearchParams } from "@/types/utils";
import { getThemes } from "@/lib/actions/mass-selections";
import { liturgyTemplates } from "@/lib/constants";

export default async function CreateMassSelectionPage(props: {
  searchParams: SearchParams;
}) {
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
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link href={"/mass-selections/new"}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Mass Selection</h1>
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
