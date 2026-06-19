import { z } from "zod";

export const collaboratorRoleSchema = z.enum([
    "MANAGER",
    "EDITOR",
    "COMMENTER",
    "VIEWER",
]);

export const shareSchema = z.object({
    id: z.string().nonempty(),
    email: z.email("Enter a valid email address."),
    role: collaboratorRoleSchema,
});

export const changeRoleSchema = z.object({
    id: z.string().nonempty(),
    userId: z.string().nonempty(),
    role: collaboratorRoleSchema,
});

export const removeAccessSchema = z.object({
    id: z.string().nonempty(),
    userId: z.string().nonempty(),
});

export type ShareableRole = z.infer<typeof collaboratorRoleSchema>;
export type ShareInput = z.infer<typeof shareSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type RemoveAccessInput = z.infer<typeof removeAccessSchema>;
