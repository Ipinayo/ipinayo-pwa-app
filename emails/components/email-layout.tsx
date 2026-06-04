import * as React from "react";

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "react-email";

/** Absolute link to the in-app notification settings, for email footers. */
export const preferencesUrl = `${process.env.AUTH_URL ?? "https://ipinayo.com"}/settings/notifications`;

export interface EmailLayoutProps {
  /** Short summary shown in the inbox preview line. */
  preview: string;
  /** Main in-body heading. */
  heading: string;
  /** Optional call-to-action button. Rendered only when both are present. */
  actionUrl?: string;
  actionLabel?: string;
  /** Overrides the default footer note (e.g. auth emails aren't notifications). */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

// Shared Ìpínayò email chrome — brand header, body section, optional CTA and footer.
export function EmailLayout({
  preview,
  heading,
  actionUrl,
  actionLabel,
  footer,
  children,
}: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brand}>Ìpínayò</Heading>
            <Text style={tagline}>SHARING JOY THROUGH MUSIC</Text>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={h2}>
              {heading}
            </Heading>

            {children}

            {actionUrl && actionLabel ? (
              <Section style={{ textAlign: "center" }}>
                <Button href={actionUrl} style={button}>
                  {actionLabel}
                </Button>
              </Section>
            ) : null}
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            {footer ?? (
              <>
                <Text style={footerText}>
                  You received this email because of your notification settings
                  on Ìpínayò.
                </Text>
                <Text style={footerText}>
                  <Link href={preferencesUrl} style={footerLink}>
                    Manage notification preferences
                  </Link>
                </Text>
              </>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#ffffff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  color: "#030f2b",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  maxWidth: "600px",
  margin: "0 auto",
  padding: "40px",
  boxShadow: "0 4px 6px #030f2b",
};

const header: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "24px",
};

const brand: React.CSSProperties = {
  color: "transparent",
  fontSize: "32px",
  fontWeight: 600,
  margin: 0,
  backgroundImage: "linear-gradient(to bottom, #175bea, #00c5fb)",
  backgroundClip: "text",
};

const tagline: React.CSSProperties = {
  color: "#175bea",
  fontSize: "12px",
  textTransform: "uppercase",
  fontStyle: "italic",
  letterSpacing: "-0.5px",
  margin: 0,
  wordSpacing: "-1.5px",
};

const content: React.CSSProperties = {
  marginBottom: "30px",
};

const h2: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 600,
  color: "#030f2b",
  marginBottom: "20px",
};

export const hr: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "30px 0",
};

const footerSection: React.CSSProperties = {
  textAlign: "center",
};

export const button: React.CSSProperties = {
  backgroundImage: "linear-gradient(135deg, #00c5fb 0%, #175bea 100%)",
  color: "#ffffff",
  textDecoration: "none",
  padding: "16px 32px",
  borderRadius: "8px",
  fontWeight: 600,
  fontSize: "16px",
  display: "inline-block",
  margin: "20px 0",
};

export const footerText: React.CSSProperties = {
  color: "#63738a",
  fontSize: "12px",
  margin: "1px",
};

export const footerLink: React.CSSProperties = {
  color: "#175bea",
  fontSize: "12px",
  textDecoration: "underline",
};

export const paragraph: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#030f2b",
  margin: "12px",
};
