import { EmailLayout, paragraph } from "../components/email-layout";

import { ActivityEventMap } from "@/types/utils";
import { Text } from "react-email";

type Metadata = ActivityEventMap["selection.cloned_by_other"]["metadata"];

export function SelectionClonedEmail({
  metadata,
  actionUrl,
}: {
  metadata: Metadata;
  actionUrl?: string;
}) {
  return (
    <EmailLayout
      preview={`${metadata.actorName} cloned your selection`}
      heading="Your selection was cloned"
      actionUrl={actionUrl}
      actionLabel="View Selection"
    >
      <Text style={paragraph}>
        <strong>{metadata.actorName}</strong> cloned your selection{" "}
        <strong>{metadata.title}</strong>.
      </Text>
    </EmailLayout>
  );
}

export default function Preview() {
  return (
    <SelectionClonedEmail
      metadata={{ title: "Easter Vigil 2026", actorName: "Tunde A." }}
      actionUrl="https://ipinayo.com/liturgical-selections"
    />
  );
}
