import { EmailLayout, paragraph } from "../components/email-layout";

import { ActivityEventMap } from "@/types/utils";
import { Text } from "@react-email/components";

type Metadata = ActivityEventMap["draft.deleted_by_other"]["metadata"];

export function DraftDeletedEmail({
  metadata,
  actionUrl,
}: {
  metadata: Metadata;
  actionUrl?: string;
}) {
  return (
    <EmailLayout
      preview={`Your draft "${metadata.title}" was deleted`}
      heading="Your draft was deleted"
      actionUrl={actionUrl}
      actionLabel="View My Selections"
    >
      <Text style={paragraph}>
        {metadata.expired ? (
          <>
            Your expired draft <strong>{metadata.title}</strong> was removed by{" "}
            <strong>{metadata.actorName}</strong>.
          </>
        ) : (
          <>
            <strong>{metadata.actorName}</strong> deleted your draft{" "}
            <strong>{metadata.title}</strong>.
          </>
        )}
      </Text>
      {metadata.reason ? (
        <Text style={paragraph}>Reason: {metadata.reason}</Text>
      ) : null}
    </EmailLayout>
  );
}

export default function Preview() {
  return (
    <DraftDeletedEmail
      metadata={{
        title: "Ordinary Time — Week 12",
        actorName: "Admin",
        expired: false,
        reason: "Duplicate of an existing selection.",
      }}
      actionUrl="https://ipinayo.com/dashboard"
    />
  );
}
