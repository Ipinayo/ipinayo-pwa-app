import { KeySignature, LiturgicalSeason, LiturgicalYear } from "@/types/models";

import { MassSelection } from "../models";
import { z } from "zod";

// Schema for a mass selection part
export const massSelectionPartSchema = z.object({
    id: z.string(),
    partName: z.string().min(1, "Part name is required"),
    songTitle: z.string().min(1, "Song title is required"),
    keySignature: z.enum(KeySignature).nullable(),
    notes: z.string().nullable(),
});

// Schema for creating a new mass selection
export const createMassSelectionSchema = z.object({
    title: z.string().min(1, "Title is required"),
    date: z.date("Invalid date"),
    liturgicalYear: z.enum(LiturgicalYear).nullable(),
    liturgicalSeason: z.enum(LiturgicalSeason).nullable(),
    liturgy: z.string().nullable(),
    themes: z.array(z.string()),
    pastoralFocus: z.string().nullable(),
    isPublic: z.boolean(),
    parts: z.array(massSelectionPartSchema).min(1, "At least one part is required"),
});

// Schema for updating a mass selection (all fields optional except parts validation)
export const updateMassSelectionSchema = createMassSelectionSchema.partial().extend({
    parts: z.array(massSelectionPartSchema).min(1, "At least one part is required").optional(),
});

export interface SelectionsResponse {
    selections: MassSelection[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface ShareResponse {
    shareableLink: string;
    pdfLink: string;
    message: string;
}