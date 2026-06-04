import * as React from "react";

import { Button, Hr, Link, Section, Text } from "react-email";
import {
  EmailLayout,
  button,
  footerText,
  hr,
} from "../components/email-layout";

export function SignInEmail({ url, email }: { url: string; email: string }) {
  return (
    <EmailLayout
      preview="Sign in to Ìpínayò"
      heading="Sign in to Ìpínayò"
      footer={
        <>
          <Text style={footerText}>This email was sent to {email}.</Text>
          <Text style={footerText}>
            If you didn&apos;t request this email, you can safely ignore it.
          </Text>
        </>
      }
    >
      <Section style={section}>
        <Text style={text}>
          Click the button below to sign in to your Ìpínayò account.
        </Text>
        <Text style={text}>This link will expire in 24 hours.</Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "0 0 12px" }}>
        <Button href={url} style={button}>
          Sign in to Ìpínayò
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
    <SignInEmail
      url="https://ipinayo.com/api/auth/callback/email?token=preview-token-123"
      email="joyce@example.com"
    />
  );
}
