import { getSelectionById, getThemes } from "@/lib/actions/mass-selections";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Params } from "@/types/utils";
import SaveForm from "@/components/app/mass-selections/save-form";

export default async function EditPage(props: { params: Params }) {
  const params = await props.params;

  const selection = await getSelectionById(params.id);
  const themes = await getThemes();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link href={`/mass-selections/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to View
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit: {selection.title}</h1>
          <p className="text-muted-foreground mt-1">
            Make changes to your Mass selection
          </p>
        </div>
      </div>

      <SaveForm mode="edit" selection={selection} themes={themes} />
    </div>
  );
}
