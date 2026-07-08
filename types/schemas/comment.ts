import { z } from "zod";

/** Which kind of entity a comment hangs off. */
export const commentEntitySchema = z.enum(["selection", "draft"]);

export const createCommentSchema = z.object({
    entity: commentEntitySchema,
    entityId: z.string().nonempty(),
    body: z.string().trim().nonempty("Write a comment.").min(3, "Comment too short").max(2000),
    parentId: z.string().nonempty().optional(),
    mentionedUserIds: z.array(z.string()).default([]),
});

export const editCommentSchema = z.object({
    commentId: z.string().nonempty(),
    body: z.string().trim().nonempty("Write a comment.").min(3, "Comment too short").max(2000),
    mentionedUserIds: z.array(z.string()).default([]),
});

export const deleteCommentSchema = z.object({
    commentId: z.string().nonempty(),
});

export const resolveCommentSchema = z.object({
    commentId: z.string().nonempty(),
    resolved: z.boolean(),
});

export type CommentEntity = z.infer<typeof commentEntitySchema>;
export type CreateCommentInput = z.input<typeof createCommentSchema>;
export type EditCommentInput = z.input<typeof editCommentSchema>;
export type DeleteCommentInput = z.input<typeof deleteCommentSchema>;
export type ResolveCommentInput = z.input<typeof resolveCommentSchema>;
