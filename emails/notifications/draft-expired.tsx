import { EmailLayout, paragraph } from "../components/email-layout";

import { ActivityEventMap } from "@/types/utils";
import { Text } from "@react-email/components";

type Metadata = ActivityEventMap["draft.expired"]["metadata"];

export function DraftExpiredEmail({
  metadata,
  actionUrl,
}: {
  metadata: Metadata;
  actionUrl?: string;
}) {
  return (
    <EmailLayout
      preview={`Your draft "${metadata.title}" has expired`}
      heading="Your draft has expired"
      actionUrl={actionUrl}
      actionLabel="View My Selections"
    >
      <Text style={paragraph}>
        Your draft <strong>{metadata.title}</strong> has expired and will be
        deleted automatically. If you still need it, recreate it from your
        dashboard.
      </Text>
    </EmailLayout>
  );
}

export default function Preview() {
  return (
    <DraftExpiredEmail
      metadata={{ title: "Christmas Midnight Mass" }}
      actionUrl="https://ipinayo.com/dashboard"
    />
  );
}
