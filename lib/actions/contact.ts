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

    const schemaToUse = session?.user?.id
        ? contactSchema.pick({ subject: true, message: true })
        : contactSchema;

    const parsed = schemaToUse.safeParse(input);
    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact form.");
    }

    let name: string | undefined;
    let email: string | undefined;

    if (session?.user?.id) {
        name = session.user.name ?? session.user.email ?? undefined;
        email = session.user.email ?? undefined;
    } else {
        name = parsed.data.name;
        email = parsed.data.email;
    }

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
        throw new Error("Could not send your message: " + error?.message);
    }
}
