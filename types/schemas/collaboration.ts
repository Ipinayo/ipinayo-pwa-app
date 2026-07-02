import { z } from "zod";

export const collaboratorRoleSchema = z.enum([
    "MANAGER",
    "EDITOR",
    "COMMENTER",
    "VIEWER",
]);

export const userRecipientSchema = z.object({
    userId: z.string().nonempty(),
    role: collaboratorRoleSchema,
});

export const inviteRecipientSchema = z.object({
    email: z.email(),
    role: collaboratorRoleSchema,
});

const hasAtLeastOneRecipient = (d: {
    userRecipients: unknown[];
    inviteRecipients: unknown[];
}) => d.userRecipients.length + d.inviteRecipients.length > 0;

export const shareSchema = z
    .object({
        id: z.string().nonempty(),
        userRecipients: z.array(userRecipientSchema).default([]),
        inviteRecipients: z.array(inviteRecipientSchema).default([]),
        message: z.string().trim().max(500).optional(),
    })
    .refine(hasAtLeastOneRecipient, { message: "Add at least one person." });

export const changeRoleSchema = z.object({
    id: z.string().nonempty(),
    userId: z.string().nonempty(),
    role: collaboratorRoleSchema,
});

export const removeAccessSchema = z.object({
    id: z.string().nonempty(),
    userId: z.string().nonempty(),
});

export const groupNameSchema = z
    .string()
    .trim()
    .nonempty("Give the group a name.")
    .min(3, "Group name is too short.")
    .max(80, "Group name is too long.");

export const createGroupSchema = z.object({
    name: groupNameSchema,
});

export const renameGroupSchema = z.object({
    groupId: z.string().nonempty(),
    name: groupNameSchema,
});

export const deleteGroupSchema = z.object({
    groupId: z.string().nonempty(),
    confirmName: z.string().nonempty("Please confirm the group name."),
});

export const addGroupMembersSchema = z
    .object({
        groupId: z.string().nonempty(),
        userRecipients: z.array(userRecipientSchema).default([]),
        inviteRecipients: z.array(inviteRecipientSchema).default([]),
    })
    .refine(hasAtLeastOneRecipient, { message: "Add at least one person." });

export const changeGroupMemberRoleSchema = z.object({
    groupId: z.string().nonempty(),
    userId: z.string().nonempty(),
    role: collaboratorRoleSchema,
});

export const removeGroupMemberSchema = z.object({
    groupId: z.string().nonempty(),
    userId: z.string().nonempty(),
});

export const attachGroupSchema = z.object({
    id: z.string().nonempty(),
    groupId: z.string().nonempty(),
});

export const revokeInvitationSchema = z.object({
    groupId: z.string().nonempty(),
    invitationId: z.string().nonempty(),
});

export type CreateGroupInput = z.input<typeof createGroupSchema>;
export type RenameGroupInput = z.input<typeof renameGroupSchema>;
export type DeleteGroupInput = z.input<typeof deleteGroupSchema>;
export type AddGroupMembersInput = z.input<typeof addGroupMembersSchema>;
export type ChangeGroupMemberRoleInput = z.input<typeof changeGroupMemberRoleSchema>;
export type RemoveGroupMemberInput = z.input<typeof removeGroupMemberSchema>;
export type AttachGroupInput = z.input<typeof attachGroupSchema>;
export type RevokeInvitationInput = z.input<typeof revokeInvitationSchema>;

export type ShareableRole = z.infer<typeof collaboratorRoleSchema>;
export type UserRecipient = z.input<typeof userRecipientSchema>;
export type InviteRecipient = z.input<typeof inviteRecipientSchema>;
export type ShareInput = z.input<typeof shareSchema>;
export type ChangeRoleInput = z.input<typeof changeRoleSchema>;
export type RemoveAccessInput = z.input<typeof removeAccessSchema>;
