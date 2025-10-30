import z from "zod";

export const locationSchema = z.object({
    country: z.string().optional(),
    countryCode: z.string().optional().nullable(),
    state: z.string().optional(),
    stateCode: z.string().optional().nullable(),
    city: z.string().optional(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    timezone: z.string().optional().nullable(),
});