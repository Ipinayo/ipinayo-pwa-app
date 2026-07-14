'use server'

import { ContactInput, contactSchema } from "@/types/schemas/contact";

import { auth } from "@/auth";
import { sendContactEmail } from "@/lib/contact-email";

/**
 * Send a Contact Us message to the support inbox. Signed-in senders don't supply
 * their name/email — those are taken from the session (and any client-sent values
 * ignored). Signed-out senders must provide both.
 */
export async function sendContactMessage(input: ContactInput) {
    const session = await auth();

    const parsed = contactSchema.safeParse(input);
    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact form.");
    }

    const name = session?.user?.id
        ? (session.user.name ?? session.user.email ?? undefined)
        : parsed.data.name;
    const email = session?.user?.id
        ? (session.user.email ?? undefined)
        : parsed.data.email;

    if (!name || !email) {
        throw new Error("Enter your name and email address.");
    }

    try {
        await sendContactEmail({
            name,
            email,
            subject: parsed.data.subject,
            message: parsed.data.message,
        });
    } catch (error: any) {
        console.error("Error sending contact message:", error);
        throw new Error("Could not send your message. Please try again later.");
    }
}
