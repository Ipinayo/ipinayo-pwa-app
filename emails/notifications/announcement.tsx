import {
  EmailLayout,
  footerLink,
  footerText,
  paragraph,
  preferencesUrl,
} from "../components/email-layout";
import { Link, Text } from "react-email";

import { ActivityEventMap } from "@/types/utils";

type Metadata = ActivityEventMap["system.announcement"]["metadata"];

export function AnnouncementEmail({
  metadata,
  actionUrl,
}: {
  metadata: Metadata;
  actionUrl?: string;
}) {
  return (
    <EmailLayout
      preview={metadata.title}
      heading={metadata.title}
      actionUrl={actionUrl}
      actionLabel={actionUrl ? "Open Ìpínayò" : undefined}
      footer={
        <>
          <Text style={footerText}>
            This is an important announcement from Ìpínayò.
          </Text>
          <Text style={footerText}>
            <Link href={preferencesUrl} style={footerLink}>
              Review your notification preferences
            </Link>
          </Text>
        </>
      }
    >
      {metadata.message.split("\n").map((line, index) => (
        <Text key={index} style={paragraph}>
          {line}
        </Text>
      ))}
    </EmailLayout>
  );
}

export default function Preview() {
  return (
    <AnnouncementEmail
      metadata={{
        title: "Scheduled maintenance this weekend",
        message:
          "Ìpínayò will be briefly unavailable on Saturday from 2–3am WAT while we ship improvements.\nThanks for your patience!",
      }}
    />
  );
}
