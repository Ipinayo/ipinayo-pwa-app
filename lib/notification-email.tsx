import "server-only";

import * as React from "react";

import { createTransport, type Transporter } from "nodemailer";

import { ActivityEventMap } from "@/types/utils";
import { AnnouncementEmail } from "@/emails/notifications/announcement";
import { DraftDeletedEmail } from "@/emails/notifications/draft-deleted";
import { DraftExpiredEmail } from "@/emails/notifications/draft-expired";
import { DraftExpiringEmail } from "@/emails/notifications/draft-expiring";
import { GenericNotificationEmail } from "@/emails/notifications/generic-notification";
import { SelectionClonedEmail } from "@/emails/notifications/selection-cloned";
import { WelcomeEmail } from "@/emails/notifications/welcome";
import { render } from "@react-email/render";

/**
 * Dedicated, pooled transporter for notification emails — intentionally NOT the
 * NextAuth/magic-link transporter. Memoized at module scope so an announcement
 * to many recipients reuses warm SMTP connections.
 */
let transporter: Transporter | null = null;
function getTransporter() {
  if (transporter) return transporter;

  const port = Number(process.env.NOTIFICATION_EMAIL_SERVER_PORT);
  transporter = createTransport({
    host: process.env.NOTIFICATION_EMAIL_SERVER_HOST,
    port,
    secure: true,
    auth: {
      user: process.env.NOTIFICATION_EMAIL_SERVER_USER,
      pass: process.env.NOTIFICATION_EMAIL_SERVER_PASSWORD,
    },
    pool: true,
    maxConnections: 3,
  });

  return transporter;
}

type EmailEntry<K extends keyof ActivityEventMap> = {
  subject: (metadata: ActivityEventMap[K]["metadata"]) => string;
  render: (
    metadata: ActivityEventMap[K]["metadata"],
    actionUrl?: string,
  ) => React.ReactElement;
};

/**
 * One email template per event type. Bespoke components for high-signal events;
 * the rest reuse GenericNotificationEmail with event-specific copy. Total over
 * ActivityEventMap so every event resolves to a real template.
 */
const notificationEmails: {
  [K in keyof ActivityEventMap]?: EmailEntry<K>;
} = {
  "user.registered": {
    subject: () => "Welcome to Ìpínayò 🎶",
    render: (m, url) => <WelcomeEmail metadata={m} actionUrl={url} />,
  },
  "selection.cloned_by_other": {
    subject: (m) => `${m.actorName} cloned your selection`,
    render: (m, url) => <SelectionClonedEmail metadata={m} actionUrl={url} />,
  },
  "draft.expiring": {
    subject: (m) => `Your draft "${m.title}" is expiring soon`,
    render: (m, url) => <DraftExpiringEmail metadata={m} actionUrl={url} />,
  },
  "draft.expired": {
    subject: (m) => `Your draft "${m.title}" has expired`,
    render: (m, url) => <DraftExpiredEmail metadata={m} actionUrl={url} />,
  },
  "draft.deleted_by_other": {
    subject: (m) => `Your draft "${m.title}" was deleted`,
    render: (m, url) => <DraftDeletedEmail metadata={m} actionUrl={url} />,
  },
  "system.announcement": {
    subject: (m) => m.title,
    render: (m, url) => <AnnouncementEmail metadata={m} actionUrl={url} />,
  },

  // Low-signal "by self" confirmations — generic template, no CTA.
  "selection.created_by_self": {
    subject: () => "Selection created",
    render: (m, url) => (
      <GenericNotificationEmail
        preview="Selection created"
        heading="Selection created"
        message={
          <span>
            Your selection <strong>{m.title}</strong> has been created
            successfully.
          </span>
        }
        actionUrl={url}
        actionLabel={url ? "View Selection" : undefined}
      />
    ),
  },
  "selection.cloned_by_self": {
    subject: () => "Selection cloned",
    render: (m, url) => (
      <GenericNotificationEmail
        preview="Selection cloned"
        heading="Selection cloned"
        message={
          <span>
            Your selection <strong>{m.title}</strong> has been cloned
            successfully.
          </span>
        }
        actionUrl={url}
        actionLabel={url ? "View Selection" : undefined}
      />
    ),
  },
  "selection.updated_by_self": {
    subject: () => "Selection updated",
    render: (m, url) => (
      <GenericNotificationEmail
        preview="Selection updated"
        heading="Selection updated"
        message={
          <span>
            Your selection <strong>{m.title}</strong> has been updated
            successfully.
          </span>
        }
        actionUrl={url}
        actionLabel={url ? "View Selection" : undefined}
      />
    ),
  },
  "selection.deleted_by_self": {
    subject: () => "Selection deleted",
    render: (m, url) => (
      <GenericNotificationEmail
        preview="Selection deleted"
        heading="Selection deleted"
        message={
          <span>
            Your selection <strong>{m.title}</strong> has been deleted
            successfully.
          </span>
        }
        actionUrl={url}
        actionLabel={url ? "Open Ìpínayò" : undefined}
      />
    ),
  },
  "draft.created_by_self": {
    subject: () => "Draft created",
    render: (_, url) => (
      <GenericNotificationEmail
        preview="Draft created"
        heading="Draft created"
        message={<span>Your draft has been created successfully.</span>}
        actionUrl={url}
        actionLabel={url ? "Open Ìpínayò" : undefined}
      />
    ),
  },
  "draft.updated_by_self": {
    subject: () => "Draft updated",
    render: (m, url) => (
      <GenericNotificationEmail
        preview="Draft updated"
        heading="Draft updated"
        message={
          <span>
            Your draft <strong>{m.title}</strong> has been updated successfully.
          </span>
        }
        actionUrl={url}
        actionLabel={url ? "View Draft" : undefined}
      />
    ),
  },
  "draft.deleted_by_self": {
    subject: () => "Draft deleted",
    render: (m, url) => (
      <GenericNotificationEmail
        preview="Draft deleted"
        heading="Draft deleted"
        message={
          <span>
            Your draft <strong>{m.title}</strong> has been deleted successfully.
          </span>
        }
        actionUrl={url}
        actionLabel={url ? "Open Ìpínayò" : undefined}
      />
    ),
  },
  "user.updated": {
    subject: () => "Your profile was updated",
    render: (m, url) => (
      <GenericNotificationEmail
        preview="Profile updated"
        heading="Profile updated"
        message={<span>Your Ìpínayò profile has been updated.</span>}
        actionUrl={url}
        actionLabel={url ? "View Profile" : undefined}
      />
    ),
  },
};

export async function sendNotificationEmail<K extends keyof ActivityEventMap>(
  to: string,
  event: K,
  metadata: ActivityEventMap[K]["metadata"],
  actionUrl?: string,
) {
  const entry = notificationEmails[event] as EmailEntry<K> | undefined;

  const subject = entry
    ? entry.subject(metadata)
    : "You have a new notification from Ìpínayò";

  const element = entry ? (
    entry.render(metadata, actionUrl)
  ) : (
    <GenericNotificationEmail
      preview={subject}
      heading={subject}
      message="You have a new notification."
      actionUrl={actionUrl ?? process.env.AUTH_URL}
      actionLabel="Open Ìpínayò"
    />
  );

  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);

  const result = await getTransporter().sendMail({
    to,
    from: process.env.EMAIL_FROM,
    subject,
    html,
    text,
  });

  if (result.rejected.length) {
    throw new Error(
      `Notification email rejected for: ${result.rejected.join(", ")}`,
    );
  }
}
