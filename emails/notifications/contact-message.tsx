import { EmailLayout, paragraph } from "../components/email-layout";

import { Link, Text } from "react-email";

export interface ContactMessageEmailProps {
  /** Display name of the person reaching out. */
  name: string;
  /** Their email address — also set as the message's Reply-To. */
  email: string;
  /** Optional subject line they provided. */
  subject?: string;
  /** The message body (plain text). */
  message: string;
}

/**
 * Internal email delivered to the support inbox when someone submits the Contact
 * Us form. Reply-To is set to the sender, so replying from the inbox reaches them
 * directly.
 */
export function ContactMessageEmail({
  name,
  email,
  subject,
  message,
}: ContactMessageEmailProps) {
  return (
    <EmailLayout
      preview={`New contact message from ${name}`}
      heading="New contact message"
      footer={
        <Text style={paragraph}>
          Sent from the Ìpínayò Contact Us form.
        </Text>
      }
    >
      <Text style={paragraph}>
        <strong>From:</strong> {name} (
        <Link href={`mailto:${email}`}>{email}</Link>)
      </Text>
      {subject ? (
        <Text style={paragraph}>
          <strong>Subject:</strong> {subject}
        </Text>
      ) : null}
      <Text style={paragraph}>
        <strong>Message:</strong>
      </Text>
      <Text style={{ ...paragraph, whiteSpace: "pre-wrap" }}>{message}</Text>
    </EmailLayout>
  );
}

export default function Preview() {
  return (
    <ContactMessageEmail
      name="Ada Obi"
      email="ada@example.com"
      subject="Question about exporting a selection"
      message={"Hello,\n\nI can't find the PDF export button on my selection. Could you help?\n\nThanks!"}
    />
  );
}
