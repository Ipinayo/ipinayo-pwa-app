import { KeySignature } from "../models";
import z from "zod";

export const massSelectionPartSchema = z.object({
    id: z.string(),
    partName: z.string().min(1, "Part name is required"),
    songTitle: z.string().min(1, "Song title is required"),
    keySignature: z.enum(KeySignature).nullable().optional(),
    notes: z.string().nullable().optional(),
});