import { EmailLayout, paragraph } from "../components/email-layout";

import { ActivityEventMap } from "@/types/utils";
import { Text } from "react-email";

type Metadata = ActivityEventMap["user.registered"]["metadata"];

export function WelcomeEmail({
  metadata,
  actionUrl,
}: {
  metadata: Metadata;
  actionUrl?: string;
}) {
  return (
    <EmailLayout
      preview="Welcome to Ìpínayò"
      heading="Welcome to Ìpínayò 🎶"
      actionUrl={actionUrl}
      actionLabel="Get started"
    >
      <Text style={paragraph}>
        Hi <strong>{metadata.name}</strong>,
      </Text>
      <Text style={paragraph}>
        Thanks for joining Ìpínayò! We&apos;re excited to have you on board.
        Start exploring and creating your liturgical selections whenever
        you&apos;re ready.
      </Text>
    </EmailLayout>
  );
}

export default function Preview() {
  return (
    <WelcomeEmail
      metadata={{ name: "Joyce" }}
      actionUrl="https://ipinayo.com"
    />
  );
}
