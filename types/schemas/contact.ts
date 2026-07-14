import { z } from "zod";

/** Message length limits, shared by the form (client) and the action (server). */
export const CONTACT_MESSAGE_MIN = 10;
export const CONTACT_MESSAGE_MAX = 2000;
export const CONTACT_MESSAGE_TOO_SHORT = "Please write a little more.";
export const CONTACT_MESSAGE_TOO_LONG = "Message is too long.";

/** Name/email are only required for signed-out senders — for signed-in users the
 *  action fills them from the session and ignores whatever the client sends, so
 *  they're optional at the schema level and enforced in the action. */
export const contactSchema = z.object({
    name: z.string().trim().min(2, "Enter your name.").max(100).optional(),
    email: z.email("Enter a valid email address.").optional(),
    subject: z.string().trim().max(150).optional(),
    message: z
        .string()
        .trim()
        .nonempty("Write a message.")
        .min(CONTACT_MESSAGE_MIN, CONTACT_MESSAGE_TOO_SHORT)
        .max(CONTACT_MESSAGE_MAX, CONTACT_MESSAGE_TOO_LONG),
});

export type ContactInput = z.input<typeof contactSchema>;
