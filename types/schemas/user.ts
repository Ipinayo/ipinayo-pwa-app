import { locationSchema } from './location';
import { z } from 'zod';

export const updateUserProfileSchema = z.object({
    name: z.string().optional(),
    bio: z.string().optional(),
    headline: z.string().max(150).optional(),
    instruments: z.array(z.string()).optional(),
    vocalFach: z.string().optional(),
    favoriteGenres: z.array(z.string()).optional(),
    parishName: z.string().optional(),
    choirName: z.string().optional(),
    parishLocation: locationSchema.optional(),
});