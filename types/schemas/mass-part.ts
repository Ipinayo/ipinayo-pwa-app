import { KeySignature } from "../models";
import z from "zod";

export const massSelectionPartSchema = z.object({
    id: z.string(),
    order: z.number().min(0),
    partName: z.string().min(1, "Part name is required"),
    songTitle: z.string().min(1, "Song title is required"),
    keySignature: z.enum(KeySignature).nullable().optional(),
    notes: z.string().nullable().optional(),
});

export const draftMassSelectionPartSchema = z.object({
    id: z.string(),
    order: z.number().min(0),
    partName: z.string().optional(),
    songTitle: z.string().optional(),
    keySignature: z.enum(KeySignature).nullable().optional(),
    notes: z.string().nullable().optional(),
});