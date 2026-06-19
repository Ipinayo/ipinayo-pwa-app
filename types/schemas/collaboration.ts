import { z } from "zod";

export const collaboratorRoleSchema = z.enum([
    "MANAGER",
    "EDITOR",
    "COMMENTER",
    "VIEWER",
]);

export const recipientSchema = z.object({
    userId: z.string().nonempty(),
    role: collaboratorRoleSchema,
});

export const shareSchema = z.object({
    id: z.string().nonempty(),
    recipients: z.array(recipientSchema).min(1, "Add at least one person."),
    message: z.string().trim().max(500).optional(),
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
export type Recipient = z.infer<typeof recipientSchema>;
export type ShareInput = z.infer<typeof shareSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type RemoveAccessInput = z.infer<typeof removeAccessSchema>;
