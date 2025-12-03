import { Box, Edit2, Music } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import BackButton from "@/components/common/back-button";
import { Button } from "@/components/ui/button";
import DeleteDraftButton from "@/components/app/mass-selections/delete-draft-button";
import Link from "next/link";
import SelectTemplateButton from "@/components/app/mass-selections/select-template-button";
import { auth } from "@/auth";
import { formatDate } from "@/lib/utils";
import { getAllDrafts } from "@/lib/actions/draft";
import { liturgyTemplates } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function SelectLiturgyTemplatePage() {
  const session = await auth();

  if (!session?.user) redirect("/signin");

  const drafts = await getAllDrafts();

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <BackButton fallback="/liturgical-selections" />
          <div>
            <h2 className="text-3xl font-display text-foreground">
              Create Liturgical Selection
            </h2>
            <p className="text-muted-foreground mt-1">
              Choose a template or continue from a draft
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Continue Draft</h3>
          {drafts.length === 0 ? (
            <Card className="text-center">
              <CardContent>
                <Box className="text-muted mx-auto mb-4 h-16 w-16" />
                <p className="mb-2 text-xl leading-none font-semibold">
                  No Drafts
                </p>
                <p className="text-muted-foreground mb-6">
                  Any drafts - unsaved selections - will appear here for you to
                  continue later.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {drafts.map((draft) => (
                <Card
                  key={draft.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-amber-400 bg-amber-50/50 dark:bg-amber-950/10"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-2">
                          {draft.title || "Untitled Draft"}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          Last updated {formatDate(draft.updatedAt)}
                        </CardDescription>
                      </div>
                      <DeleteDraftButton
                        draftId={draft.id}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mt-1 -mr-2"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {Array.isArray(draft.parts) ? draft.parts.length : 0}{" "}
                      part(s)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-1 bg-transparent"
                        asChild
                      >
                        <Link href={`/liturgical-selections/new/${draft.id}`}>
                          <Edit2 className="h-3 w-3" />
                          Continue
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="my-8 border-t"></div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Create from Template</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {liturgyTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card
                  key={template.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50"
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {template.parts.length > 0
                          ? `${template.parts.length} pre-filled parts:`
                          : "Empty template"}
                      </p>
                      {template.parts.length > 0 && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          {template.parts.slice(0, 4).map((part, index) => (
                            <div key={index} className="flex items-center">
                              <span className="w-2 h-2 bg-primary/30 rounded-full mr-2"></span>
                              {part}
                            </div>
                          ))}
                          {template.parts.length > 4 && (
                            <div className="flex items-center text-muted-foreground/70">
                              <span className="w-2 h-2 bg-primary/20 rounded-full mr-2"></span>
                              +{template.parts.length - 4} more sections
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <SelectTemplateButton
                      className="w-full mt-4 bg-transparent"
                      variant="outline"
                      templateId={template.id}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't see what you need? Start with the blank template and customize
            it to your requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
