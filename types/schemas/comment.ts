import { z } from "zod";

/** Visible-text limits, shared by the composer (client) and the action (server).
 *  `body` is rich HTML, so these are checked against its text, not its markup. */
export const COMMENT_MIN = 3;
export const COMMENT_MAX = 10000;
export const COMMENT_TOO_SHORT = "Comment too short";
export const COMMENT_TOO_LONG = "Comment too long, break into multiple comments.";

/** Which kind of entity a comment hangs off. */
export const commentEntitySchema = z.enum(["selection", "draft"]);

// `body` is sanitized HTML; this only bounds the payload. The visible-text
// length is validated against COMMENT_MIN/MAX after sanitizing.
const bodyHtml = z.string().nonempty("Write a comment.").min(COMMENT_MIN, COMMENT_TOO_SHORT).max(COMMENT_MAX, COMMENT_TOO_LONG);

export const createCommentSchema = z.object({
    entity: commentEntitySchema,
    entityId: z.string().nonempty(),
    body: bodyHtml,
    parentId: z.string().nonempty().optional(),
    mentionedUserIds: z.array(z.string()).default([]),
});

export const editCommentSchema = z.object({
    commentId: z.string().nonempty(),
    body: bodyHtml,
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
