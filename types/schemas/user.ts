import { locationSchema } from './location';
import { z } from 'zod';

export const updateUserProfileSchema = z.object({
    name: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    headline: z.string().max(150).nullable().optional(),
    instruments: z.array(z.string()).nullable().optional(),
    vocalFach: z.string().nullable().optional(),
    favoriteGenres: z.array(z.string()).nullable().optional(),
    parishName: z.string().nullable().optional(),
    choirName: z.string().nullable().optional(),
    parishLocation: locationSchema.nullable().optional(),
});