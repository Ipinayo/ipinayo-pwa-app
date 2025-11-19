import { LiturgicalSeason, LiturgicalYear } from "@/types/models";

import { locationSchema } from "./location";
import { massSelectionPartSchema } from "./mass-part";
import { z } from "zod";

// Schema for creating a new mass selection
export const createMassSelectionSchema = z.object({
    title: z.string().min(1, "Title is required"),
    date: z.date("Invalid date"),
    liturgicalYear: z.enum(LiturgicalYear).nullable().optional(),
    liturgicalSeason: z.enum(LiturgicalSeason).nullable().optional(),
    liturgy: z.string().nullable().optional(),
    themes: z.array(z.string()
        .min(3, "Each theme must be at least 3 characters long")
        .max(50, "Each theme must be at most 50 characters long"))
        .max(10, "Cannot have more than 10 themes"),
    pastoralFocus: z.string().nullable().optional(),
    isPublic: z.boolean().default(false),
    parishName: z.string().nullable().optional(),
    choirName: z.string().nullable().optional(),
    parishLocation: locationSchema.nullable().optional(),
    parts: z.array(massSelectionPartSchema).min(1, "At least one part is required"),
});

// Schema for updating a mass selection (all fields optional except parts validation)
export const updateMassSelectionSchema = createMassSelectionSchema.partial().extend({
    parts: z.array(massSelectionPartSchema).min(1, "At least one part is required").optional(),
});
