import "server-only";

import {
  KeySignature,
  LiturgicalSeason,
  LiturgicalYear,
  NewMassSelection,
} from "@/types/models";
import {
  createNewDraft,
  deleteDraft,
  getAllDrafts,
  getDraftById,
  updateDraft,
} from "@/lib/actions/draft";
import {
  createSelection,
  deleteSelection,
  getAllPartNames,
  getSelectionById,
  getSelections,
  getThemes,
  getUserSelections,
  updateSelection,
} from "@/lib/actions/mass-selections";

import { DraftMassSelection } from "@/types/schemas/mass-selections";
import { getLiturgicalDay } from "@/lib/liturgy/calendar";
import { liturgyTemplates } from "@/lib/constants";
import { normalizeDate } from "@/lib/utils";
import { tool } from "ai";
import { z } from "zod";

/**
 * Tools the assistant uses. Each is a thin wrapper over an existing server
 * action, so authentication + ownership checks + activity dispatch already
 * happen inside the action (it reads the session via `auth()`); the userId is
 * NEVER taken from the model. Inputs use model-friendly shapes (no internal
 * ids / ordering) and are mapped to the canonical schemas here. Tool outputs
 * are small JSON summaries; entity-bearing tools include an `entity` field the
 * UI renders as a draft/selection card.
 */

// ---- Shared model-facing field shapes ----------------------------------

const partInput = z.object({
  partName: z
    .string()
    .describe("e.g. Entrance, Kyrie, Gloria, Responsorial Psalm, Communion"),
  songTitle: z.string(),
  keySignature: z.enum(KeySignature).nullish(),
  notes: z.string().nullish(),
});
type PartInput = z.infer<typeof partInput>;

const selectionFields = {
  title: z.string().nullish(),
  date: z.string().describe("ISO calendar date, YYYY-MM-DD").nullish(),
  liturgicalYear: z.enum(LiturgicalYear).nullish(),
  liturgicalSeason: z.enum(LiturgicalSeason).nullish(),
  liturgy: z.string().nullish(),
  themes: z
    .array(z.string().min(3).max(50))
    .max(10)
    .describe("Short theme tags, 3–50 chars each")
    .nullish(),
  pastoralFocus: z.string().nullish(),
  isPublic: z.boolean().nullish(),
  parishName: z.string().nullish(),
  choirName: z.string().nullish(),
  parts: z.array(partInput).nullish(),
};

// ---- Mapping helpers ----------------------------------------------------

type RawPart = {
  id?: string;
  order?: number;
  partName?: string | null;
  songTitle?: string | null;
  keySignature?: KeySignature | null;
  notes?: string | null;
};

/** Re-index parts and assign temp ids, the shape the draft layer expects. */
function toDraftParts(list: (RawPart | PartInput)[]): DraftMassSelection["parts"] {
  return list.map((p, i) => ({
    id: (p as RawPart).id ?? `temp-${i + 1}`,
    order: i,
    partName: p.partName ?? "",
    songTitle: p.songTitle ?? "",
    keySignature: p.keySignature ?? null,
    notes: p.notes ?? "",
  }));
}

function toDate(value: string | null | undefined, fallback: Date | null) {
  if (value === undefined) return fallback;
  if (value === null) return null;
  return normalizeDate(new Date(value));
}

/** Present a draft/selection to the model without internal bookkeeping. */
function presentParts(parts: RawPart[] | undefined | null) {
  return (parts ?? []).map((p) => ({
    partName: p.partName ?? "",
    songTitle: p.songTitle ?? "",
    keySignature: p.keySignature ?? null,
    notes: p.notes ?? null,
  }));
}

function isoDate(date: Date | null | undefined) {
  return date ? new Date(date).toISOString().slice(0, 10) : null;
}

async function fail(error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong";
  return { ok: false as const, error: message };
}

// ---- Tools --------------------------------------------------------------

export const selectionTools = {
  list_templates: tool({
    description:
      "List the available liturgy templates (id, name, the parts each pre-fills). Use the id with create_draft to start from a template.",
    inputSchema: z.object({}),
    execute: async () =>
      liturgyTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        parts: t.parts,
      })),
  }),

  get_themes: tool({
    description:
      "List themes already used across selections, to reuse for consistency.",
    inputSchema: z.object({}),
    execute: async () => {
      try {
        return { themes: await getThemes() };
      } catch (e) {
        return fail(e);
      }
    },
  }),

  get_part_names: tool({
    description: "List part names already in use, to reuse for consistency.",
    inputSchema: z.object({}),
    execute: async () => {
      try {
        return { partNames: await getAllPartNames() };
      } catch (e) {
        return fail(e);
      }
    },
  }),

  get_liturgical_day: tool({
    description:
      "Resolve a calendar date to the proper of the day from the General Roman Calendar: its proper name (e.g. 'Third Sunday in Ordinary Time'), rank (Solemnity/Feast/Memorial/Sunday/Weekday), season, Sunday cycle (Year A/B/C), liturgical colour, whether it's a holy day of obligation, and any other celebrations that fall on the same day (e.g. optional memorials). Use this after working out the date the user means (e.g. 'next Sunday') to ground the title, themes, and song suggestions. Always present the day's identity (name + any solemnity/feast) to the user. Omit `date` for today.",
    inputSchema: z.object({
      date: z.string().describe("ISO calendar date YYYY-MM-DD").nullish(),
    }),
    execute: async ({ date }) => {
      try {
        const d = date ? new Date(date) : new Date();
        if (Number.isNaN(d.getTime())) {
          return { ok: false as const, error: "Invalid date." };
        }
        return { ok: true as const, ...(await getLiturgicalDay(d)) };
      } catch (e) {
        return fail(e);
      }
    },
  }),

  find_public_selections: tool({
    description:
      "Search selections the community has shared publicly, to see what themes and songs others used for a similar time. Filter by liturgical season and/or Year cycle (from get_liturgical_day) and an optional keyword. Read a promising one with read_selection to see its actual songs and keys. Prefer this over guessing; only fall back to your own knowledge when the community has nothing suitable.",
    inputSchema: z.object({
      query: z.string().nullish(),
      season: z.enum(LiturgicalSeason).nullish(),
      year: z.enum(LiturgicalYear).nullish(),
    }),
    execute: async ({ query, season, year }) => {
      try {
        const { selections } = await getSelections({
          isPublic: true,
          query: query ?? "",
          season: season ?? undefined,
          year: year ?? undefined,
          limit: 8,
        });
        return {
          selections: selections.map((s) => ({
            id: s.id,
            title: s.title,
            date: isoDate(s.date),
            season: s.liturgicalSeason,
            year: s.liturgicalYear,
            themes: s.themes.map((t) => t.name),
          })),
        };
      } catch (e) {
        return fail(e);
      }
    },
  }),

  find_my_drafts: tool({
    description:
      "Find the signed-in user's in-progress drafts, optionally filtered by a search query. Use to resolve a draft the user refers to.",
    inputSchema: z.object({ query: z.string().nullish() }),
    execute: async ({ query }) => {
      try {
        const { drafts } = await getAllDrafts({ query: query ?? "", limit: 8 });
        return {
          drafts: drafts.map((d) => ({
            id: d.id,
            title: d.title || "Untitled draft",
            updatedAt: isoDate(d.updatedAt),
          })),
        };
      } catch (e) {
        return fail(e);
      }
    },
  }),

  find_my_selections: tool({
    description:
      "Find the signed-in user's finished selections, optionally filtered by a search query. Use to resolve a selection the user refers to, or to read one for comparison.",
    inputSchema: z.object({ query: z.string().nullish() }),
    execute: async ({ query }) => {
      try {
        const { selections } = await getUserSelections({
          query: query ?? "",
          limit: 8,
        });
        return {
          selections: selections.map((s) => ({
            id: s.id,
            title: s.title,
            date: isoDate(s.date),
          })),
        };
      } catch (e) {
        return fail(e);
      }
    },
  }),

  read_draft: tool({
    description: "Read the full contents of one of the user's drafts.",
    inputSchema: z.object({ draftId: z.string() }),
    execute: async ({ draftId }) => {
      try {
        const d = await getDraftById(draftId);
        return {
          id: d.id,
          title: d.title,
          date: isoDate(d.date),
          liturgicalYear: d.liturgicalYear,
          liturgicalSeason: d.liturgicalSeason,
          themes: d.themes,
          isPublic: d.isPublic,
          parishName: d.parishName,
          choirName: d.choirName,
          parts: presentParts(d.parts as RawPart[]),
          entity: { type: "draft" as const, id: d.id, title: d.title || "Untitled draft" },
        };
      } catch (e) {
        return fail(e);
      }
    },
  }),

  read_selection: tool({
    description:
      "Read the full contents of a selection by id (the user's own or a public one).",
    inputSchema: z.object({ selectionId: z.string() }),
    execute: async ({ selectionId }) => {
      try {
        const s = await getSelectionById(selectionId);
        return {
          id: s.id,
          title: s.title,
          date: isoDate(s.date),
          liturgicalYear: s.liturgicalYear,
          liturgicalSeason: s.liturgicalSeason,
          themes: s.themes.map((t) => t.name),
          parts: presentParts(s.parts as RawPart[]),
          entity: { type: "selection" as const, id: s.id, title: s.title },
        };
      } catch (e) {
        return fail(e);
      }
    },
  }),

  create_draft: tool({
    description:
      "Start a new draft. Pass a templateId (from list_templates) to pre-fill its parts, or omit it for a blank draft. Returns the new draft id — populate it with update_draft next.",
    inputSchema: z.object({ templateId: z.string().nullish() }),
    execute: async ({ templateId }) => {
      try {
        const draft = await createNewDraft(templateId ?? "");
        return {
          ok: true as const,
          draftId: draft.id,
          parts: presentParts(draft.parts as RawPart[]),
          entity: { type: "draft" as const, id: draft.id, title: draft.title || "Untitled draft" },
        };
      } catch (e) {
        return fail(e);
      }
    },
  }),

  update_draft: tool({
    description:
      "Save fields onto a draft. Only pass the fields you want to set; for `parts`, pass the COMPLETE list of parts the draft should have (it replaces the existing parts).",
    inputSchema: z.object({ draftId: z.string(), ...selectionFields }),
    execute: async ({ draftId, parts, date, themes, ...rest }) => {
      try {
        const current = await getDraftById(draftId);
        const merged: DraftMassSelection = {
          title: rest.title ?? current.title ?? "",
          date: toDate(date, current.date),
          liturgicalYear: rest.liturgicalYear ?? current.liturgicalYear ?? null,
          liturgicalSeason:
            rest.liturgicalSeason ?? current.liturgicalSeason ?? null,
          liturgy: rest.liturgy ?? current.liturgy ?? null,
          themes: themes ?? current.themes ?? [],
          pastoralFocus: rest.pastoralFocus ?? current.pastoralFocus ?? null,
          isPublic: rest.isPublic ?? current.isPublic,
          parishName: rest.parishName ?? current.parishName ?? null,
          choirName: rest.choirName ?? current.choirName ?? null,
          parishLocation: (current.parishLocation as DraftMassSelection["parishLocation"]) ?? null,
          parts: toDraftParts((parts ?? (current.parts as RawPart[])) ?? []),
        };
        const updated = await updateDraft(draftId, merged);
        return {
          ok: true as const,
          draftId: updated.id,
          title: updated.title,
          parts: presentParts(updated.parts as RawPart[]),
          entity: { type: "draft" as const, id: updated.id, title: updated.title || "Untitled draft" },
        };
      } catch (e) {
        return fail(e);
      }
    },
  }),

  save_selection: tool({
    description:
      "Promote a draft into a finished selection. Requires the draft to have a title, a date, and at least one part with a part name and song title. Deletes the draft on success.",
    inputSchema: z.object({ draftId: z.string() }),
    execute: async ({ draftId }) => {
      try {
        const d = await getDraftById(draftId);
        if (!d.date) {
          return {
            ok: false as const,
            error: "The draft has no date yet. Ask the user for the liturgy date before saving.",
          };
        }
        const data: NewMassSelection = {
          title: d.title,
          date: d.date,
          liturgicalYear: d.liturgicalYear,
          liturgicalSeason: d.liturgicalSeason,
          liturgy: d.liturgy,
          themes: d.themes,
          pastoralFocus: d.pastoralFocus,
          isPublic: d.isPublic,
          parishName: d.parishName,
          choirName: d.choirName,
          parishLocation: (d.parishLocation as NewMassSelection["parishLocation"]) ?? null,
          parts: toDraftParts(d.parts as RawPart[]).map((p) => ({
            ...p,
            partName: p.partName ?? "",
            songTitle: p.songTitle ?? "",
          })),
        };
        const selection = await createSelection(data, draftId);
        return {
          ok: true as const,
          selectionId: selection.id,
          title: selection.title,
          entity: { type: "selection" as const, id: selection.id, title: selection.title },
        };
      } catch (e) {
        return fail(e);
      }
    },
  }),

  update_selection: tool({
    description:
      "Update an existing finished selection. Only pass the fields to change; for `parts`, pass the COMPLETE replacement list.",
    inputSchema: z.object({ selectionId: z.string(), ...selectionFields }),
    execute: async ({ selectionId, parts, date, ...rest }) => {
      try {
        const data: Partial<NewMassSelection> = {
          ...(rest.title != null && { title: rest.title }),
          ...(date != null && { date: normalizeDate(new Date(date)) }),
          ...(rest.liturgicalYear !== undefined && { liturgicalYear: rest.liturgicalYear }),
          ...(rest.liturgicalSeason !== undefined && { liturgicalSeason: rest.liturgicalSeason }),
          ...(rest.liturgy !== undefined && { liturgy: rest.liturgy }),
          ...(rest.themes != null && { themes: rest.themes }),
          ...(rest.pastoralFocus !== undefined && { pastoralFocus: rest.pastoralFocus }),
          ...(rest.isPublic != null && { isPublic: rest.isPublic }),
          ...(rest.parishName !== undefined && { parishName: rest.parishName }),
          ...(rest.choirName !== undefined && { choirName: rest.choirName }),
          ...(parts != null && {
            parts: toDraftParts(parts).map((p) => ({
              ...p,
              partName: p.partName ?? "",
              songTitle: p.songTitle ?? "",
            })),
          }),
        };
        await updateSelection(selectionId, data);
        const refreshed = await getSelectionById(selectionId);
        return {
          ok: true as const,
          selectionId,
          title: refreshed.title,
          entity: { type: "selection" as const, id: selectionId, title: refreshed.title },
        };
      } catch (e) {
        return fail(e);
      }
    },
  }),

  delete_draft: tool({
    description:
      "Delete one of the user's drafts. Confirm with the user before calling.",
    inputSchema: z.object({ draftId: z.string() }),
    execute: async ({ draftId }) => {
      try {
        await deleteDraft(draftId);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },
  }),

  delete_selection: tool({
    description:
      "Delete one of the user's finished selections. Confirm with the user before calling.",
    inputSchema: z.object({ selectionId: z.string() }),
    execute: async ({ selectionId }) => {
      try {
        await deleteSelection(selectionId);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },
  }),
};
