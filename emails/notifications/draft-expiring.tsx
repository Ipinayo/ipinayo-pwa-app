import { EmailLayout, paragraph } from "../components/email-layout";

import { ActivityEventMap } from "@/types/utils";
import { Text } from "react-email";

type Metadata = ActivityEventMap["draft.expiring"]["metadata"];

export function DraftExpiringEmail({
  metadata,
  actionUrl,
}: {
  metadata: Metadata;
  actionUrl?: string;
}) {
  return (
    <EmailLayout
      preview={`Your draft "${metadata.title}" is expiring soon`}
      heading="Your draft is expiring soon"
      actionUrl={actionUrl}
      actionLabel="Review draft"
    >
      <Text style={paragraph}>
        Your draft <strong>{metadata.title}</strong> is about to expire. Please
        take action soon to avoid it being deleted automatically.
      </Text>
    </EmailLayout>
  );
}

export default function Preview() {
  return (
    <DraftExpiringEmail
      metadata={{ title: "Pentecost Sunday" }}
      actionUrl="https://ipinayo.com/liturgical-selections/new"
    />
  );
}
