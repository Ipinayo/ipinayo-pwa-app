import { EmailLayout, paragraph } from "../components/email-layout";

import { Text } from "@react-email/components";

export interface GenericNotificationEmailProps {
  preview: string;
  heading: string;
  message: React.ReactNode;
  actionUrl?: string;
  actionLabel?: string;
}

/**
 * Fallback / catch-all notification email used for event types that don't have
 * a bespoke template (mostly low-signal "by self" confirmations). Driven purely
 * by the strings the registry passes in.
 */
export function GenericNotificationEmail({
  preview,
  heading,
  message,
  actionUrl,
  actionLabel,
}: GenericNotificationEmailProps) {
  return (
    <EmailLayout
      preview={preview}
      heading={heading}
      actionUrl={actionUrl}
      actionLabel={actionLabel}
    >
      <Text style={paragraph}>{message}</Text>
    </EmailLayout>
  );
}

export default function Preview() {
  return (
    <GenericNotificationEmail
      preview="You have a new notification"
      heading="Selection updated"
      message={
        <span>
          Your selection <strong>Easter Vigil 2026</strong> has been updated
          successfully.
        </span>
      }
    />
  );
}
