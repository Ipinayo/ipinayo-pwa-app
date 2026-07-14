import "server-only";

import { ContactMessageEmail } from "@/emails/notifications/contact-message";
import { getNotificationTransporter } from "@/lib/notification-email";
import { render } from "@react-email/render";

/** Where Contact Us submissions are delivered. */
function getContactRecipient() {
  const to = process.env.CONTACT_EMAIL ?? process.env.ADMIN_MAIL;
  if (!to) {
    throw new Error("No contact recipient configured (set CONTACT_EMAIL).");
  }
  return to;
}

/**
 * Deliver a Contact Us submission to the support inbox. Reuses the pooled
 * notification transporter; Reply-To is the sender so support can reply directly.
 */
export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const element = (
    <ContactMessageEmail
      name={name}
      email={email}
      subject={subject}
      message={message}
    />
  );

  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);

  const result = await getNotificationTransporter().sendMail({
    to: getContactRecipient(),
    from: process.env.NOTIFICATION_EMAIL_FROM,
    replyTo: email,
    subject: subject
      ? `[Contact] ${subject}`
      : `New contact message from ${name}`,
    html,
    text,
  });

  if (result.rejected.length) {
    throw new Error(
      `Contact email rejected for: ${result.rejected.join(", ")}`,
    );
  }
}
