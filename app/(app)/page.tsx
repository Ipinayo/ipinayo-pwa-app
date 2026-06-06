import { ArrowRight, ListMusic, Share2, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SortBy, SortOrder } from "@/types/utils";

import { AssistantTrigger } from "@/components/app/assistant/assistant-trigger";
import { Button } from "@/components/ui/button";
import { Fragment } from "react";
import Link from "next/link";
import MassSelectionCard from "@/components/app/mass-selections/mass-selection-card";
import SelectTemplateButton from "@/components/app/draft-selections/select-template-button";
import { getSelections } from "@/lib/actions/mass-selections";
import { getUser } from "@/lib/actions/user";
import { liturgyTemplates } from "@/lib/constants";

const STEPS = [
  {
    icon: Sparkles,
    title: "Start in seconds",
    description:
      "Ask Ìpínayò AI to draft a selection from a description, or begin from a template or cloned selection.",
  },
  {
    icon: ListMusic,
    title: "Build the selection parts",
    description:
      "Set each part of the liturgy — entrance, psalm, offertory, communion — with songs, keys, and notes.",
  },
  {
    icon: Share2,
    title: "Share & export",
    description:
      "Publish for your community to view and clone, or export a clean PDF for your choir.",
  },
];

export default async function HomePage() {
  const user = await getUser().catch(() => null);

  let featured: Awaited<ReturnType<typeof getSelections>>["selections"] = [];
  try {
    const community = await getSelections({
      isPublic: true,
      limit: 3,
      sortBy: SortBy.UPDATED_AT,
      sortOrder: SortOrder.DESC,
    });
    featured = community.selections;
  } catch {
    featured = [];
  }

  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0];
  const quickTemplates = liturgyTemplates.slice(0, 3);

  return (
    <div className="w-full max-w-full space-y-14 md:space-y-20">
      {/* Intro */}
      <section className="space-y-6">
        <div className="max-w-2xl space-y-3">
          {firstName && (
            <p className="text-muted-foreground text-sm font-medium">
              Welcome back, {firstName}
            </p>
          )}
          <h1 className="font-display text-3xl leading-tight md:text-4xl">
            Plan and Share the Music for Every Liturgy.
          </h1>
          <p className="text-muted-foreground md:text-lg">
            From Sunday liturgies to weddings and funerals, shape the selection
            part by part — then share it with your choir and the wider
            community.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user ? (
            <>
              <AssistantTrigger />
              <Button size="lg" variant="outline" asChild>
                <Link href="/liturgical-selections/new">Create manually</Link>
              </Button>
            </>
          ) : (
            <Button size="lg" asChild>
              <Link href="/liturgical-selections/new">Get started</Link>
            </Button>
          )}
          <Button size="lg" variant="ghost" asChild>
            <Link href="/liturgical-selections">
              Browse community
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Recently shared by the community */}
      {featured.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl">
                Recently shared by the community
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Real selections from other choirs — view, download, or clone to
                make your own.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link href="/liturgical-selections">
                See all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 assistant-open:lg:grid-cols-1 assistant-open:xl:grid-cols-2">
            {featured.map((selection) => (
              <MassSelectionCard key={selection.id} selection={selection} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="space-y-6">
        <h2 className="font-display text-2xl">How it works</h2>

        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
          {STEPS.map((step, index) => (
            <Fragment key={step.title}>
              <div className="flex flex-1 flex-col gap-2 rounded-xl p-5">
                <div className="flex items-center gap-2.5">
                  <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                    <step.icon className="size-4" />
                  </span>
                  <span className="text-muted-foreground text-xs font-medium">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg">{step.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>

              {index < STEPS.length - 1 && (
                <ArrowRight className="text-muted-foreground mx-auto size-5 shrink-0 rotate-90 sm:rotate-0" />
              )}
            </Fragment>
          ))}
        </div>
      </section>

      {/* Popular templates */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">Popular templates</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Pre-filled parts for common liturgies — tweak and go.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild className="shrink-0">
            <Link href="/liturgical-selections/new">
              All templates
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 assistant-open:lg:grid-cols-2">
          {quickTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.id} className="flex flex-col">
                <CardHeader>
                  <div className="bg-primary/10 mb-2 flex size-11 items-center justify-center rounded-full">
                    <Icon className="text-primary size-5" />
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <SelectTemplateButton
                    templateId={template.id}
                    variant="outline"
                    className="w-full"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
