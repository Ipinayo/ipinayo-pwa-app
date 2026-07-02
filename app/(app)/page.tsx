import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ListMusic,
  PlayCircle,
  Share2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SortBy, SortOrder } from "@/types/utils";
import {
  getFeaturedSelections,
  getSelections,
} from "@/lib/actions/mass-selections";

import { Button } from "@/components/ui/button";
import CreateSelectionTrigger from "@/components/common/create-selection-trigger";
import { Fragment } from "react";
import Link from "next/link";
import MassSelectionCard from "@/components/app/mass-selections/mass-selection-card";
import SelectTemplateButton from "@/components/app/draft-selections/select-template-button";
import { getUser } from "@/lib/actions/user";
import { liturgyTemplates } from "@/lib/constants";

const STEPS = [
  {
    icon: BookOpen,
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

const FAQS = [
  {
    question: "What is Ìpínayò?",
    answer:
      "Ìpínayò helps you plan and share the music for Catholic Liturgies — Sunday Mass, weddings, funerals and more. Draft a selection with AI, start from a template, or build one from scratch, then share it with your choir and the wider community.",
  },
  {
    question: "How do I create a selection?",
    answer:
      "There are multiple ways to create a selection.  To manually add the song for each part, click “Create Manually” to begin, pick a template for a common liturgy or start from a blank template.  You can also clone an existing public selection and adjust it. Finally, you can click 'Create with Ìpínayò AI', describe the celebration and Ìpínayò AI will draft a full selection for you to refine.",
  },
  {
    question: "Can Ìpínayò suggest the music for me?",
    answer:
      "Yes, using Ìpínayò AI at the top of the page. Describe the celebration — its season, feast, or theme — and Ìpínayò AI drafts a full selection with parts you can refine.",
  },
  {
    question: "What are collaborator groups?",
    answer:
      "A collaborator group (found in the settings) is a reusable set of people, like your choir selections team. Attach it to any selection or draft, and updating the group updates access everywhere it’s used.",
  },
  {
    question: "Can I invite someone who doesn’t have an account yet?",
    answer:
      "Yes. Enter their email when adding them to a collaborator group or as a collaborator in a selection and they’ll receive an invitation link. Signing in creates their account and grants the access you gave them automatically.",
  },
  {
    question: "What’s the difference between public and private selections?",
    answer:
      "Public selections can be viewed, downloaded, and cloned by the whole community. Private selections stay visible only to you and the people you share them with. The visibility setting can be changed at any time, and collaborators can always view and clone a selection regardless of its visibility.",
  },
  {
    question: "Can I export a selection for my choir?",
    answer:
      "Yes — export a clean PDF of any selection to print or hand out at rehearsal.",
  },
  {
    question: "Do drafts stay forever?",
    answer:
      "Drafts save your work in progress but expire after a period of inactivity. You’ll get a reminder before one is removed, so you can finish or publish it in time.",
  },
];

export default async function HomePage() {
  const user = await getUser().catch(() => null);

  const featuredThisWeek = await getFeaturedSelections();
  const selections = await getSelections({
    isPublic: true,
    isFeatured: false,
    limit: 3,
    sortBy: SortBy.DATE,
    sortOrder: SortOrder.DESC,
  }).catch(() => null);

  const communitySelections = selections?.selections || [];

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
            From Sunday liturgies to weddings and funerals, shape your music
            selection and share it with your choir and the wider community.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CreateSelectionTrigger />
          <Button size="lg" variant="ghost" asChild>
            <Link href="/liturgical-selections">
              Browse community
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

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

      {/* Featured this week */}
      {featuredThisWeek.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl">Featured this week</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Curated selections from trusted contributors — clone one as a
                starting point for your own.
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
            {featuredThisWeek.map((selection) => (
              <MassSelectionCard key={selection.id} selection={selection} />
            ))}
          </div>
        </section>
      )}

      {/* Recently shared by the community */}
      {communitySelections.length > 0 && (
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
            {communitySelections.map((selection) => (
              <MassSelectionCard key={selection.id} selection={selection} />
            ))}
          </div>
        </section>
      )}

      {/* Popular templates */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">Popular templates</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Pre-filled parts for common liturgies — tweak and go!
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

      {/* FAQ */}
      <section className="space-y-5 w-full">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <h2 className="font-display text-2xl">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              New to Ìpínayò? Here’s how it works.
            </p>
          </div>
          <Button variant="link" className="font-bold text-foreground" asChild>
            <Link
              href={process.env.NEXT_PUBLIC_WALKTHROUGH_VIDEO_URL || ""}
              target="_blank"
              rel="noopener noreferrer"
            >
              <PlayCircle className="size-4" />
              Watch the walkthrough
            </Link>
          </Button>
        </div>

        <div className="w-full">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group border-border border-b"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown className="text-muted-foreground size-4 transition-transform group-open:rotate-180" />
              </summary>
              <p className="text-muted-foreground font-medium pb-4 text-sm leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
