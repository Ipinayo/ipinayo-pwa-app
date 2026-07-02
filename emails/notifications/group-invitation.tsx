import * as React from "react";

import { Button, Hr, Link, Section, Text } from "react-email";
import { EmailLayout, button, footerText, hr } from "../components/email-layout";

/** One pending invite's display label and the person who sent it. */
export type InvitePreview = { label: string; inviterName: string };

/** Join labels into "A", "A and B", or "A, B and C". */
function formatList(labels: string[]) {
  if (labels.length <= 1) return labels[0] ?? "";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

/**
 * Sent in place of the plain sign-in email when the address has pending invites.
 * The `url` IS a NextAuth magic link — clicking it signs the person in (creating
 * their account if needed), and the invites are claimed on sign-in. Lists every
 * pending invite so one click resolves them all.
 */
export function GroupInvitationEmail({
  url,
  email,
  invites,
}: {
  url: string;
  email: string;
  invites: InvitePreview[];
}) {
  const inviter = invites[0]?.inviterName ?? "Someone";
  const list = formatList(invites.map((i) => i.label));
  const multiple = invites.length > 1;

  return (
    <EmailLayout
      preview={`${inviter} invited you to collaborate on Ìpínayò`}
      heading="You've been invited to collaborate"
      footer={
        <>
          <Text style={footerText}>This invitation was sent to {email}.</Text>
          <Text style={footerText}>
            If you weren&apos;t expecting it, you can safely ignore this email.
          </Text>
        </>
      }
    >
      <Section style={section}>
        <Text style={text}>
          <strong>{inviter}</strong> invited you to collaborate on {list} on
          Ìpínayò.
        </Text>
        <Text style={text}>
          Click below to sign in{multiple ? " and accept all invitations" : ""}.
          A new account is created for you automatically if you don&apos;t have
          one. This link will expire in 24 hours.
        </Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "0 0 12px" }}>
        <Button href={url} style={button}>
          Accept &amp; sign in
        </Button>
      </Section>

      <Hr style={hr} />

      <Section style={section}>
        <Text style={{ ...text, color: "#63738a", fontWeight: 700 }}>
          Having trouble with the button?
        </Text>
        <Text style={{ fontSize: "14px", lineHeight: "1.6", color: "#63738a" }}>
          Copy and paste this link into your browser:
        </Text>
        <Text>
          <Link href={url} style={link}>
            {url}
          </Link>
        </Text>
      </Section>
    </EmailLayout>
  );
}

const link: React.CSSProperties = {
  color: "#175bea",
  wordBreak: "break-all",
  textDecoration: "underline",
  fontSize: "14px",
};

const section: React.CSSProperties = {
  textAlign: "left",
  margin: "12px",
};

const text: React.CSSProperties = {
  color: "#030f2b",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "1px",
};

export default function Preview() {
  return (
    <GroupInvitationEmail
      url="https://ipinayo.com/api/auth/callback/email?token=preview-token-123"
      email="new.person@example.com"
      invites={[
        { label: "St. Cecilia Choir", inviterName: "Tunde A." },
        { label: "Easter Vigil 2026", inviterName: "Tunde A." },
      ]}
    />
  );
}
