import { EmailLayout, paragraph } from "../components/email-layout";

import { ActivityEventMap } from "@/types/utils";
import { Text } from "@react-email/components";

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
