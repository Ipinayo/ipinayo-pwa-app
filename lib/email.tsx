import { GroupInvitationEmail } from "@/emails/notifications/group-invitation";
import type { NodemailerConfig } from "next-auth/providers/nodemailer";
import { SignInEmail } from "@/emails/auth/sign-in";
import { createTransport } from "nodemailer";
import { findPendingInvitationsForEmail } from "@/db/collaborator-groups";
import { render } from "@react-email/render";

export async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}: {
  identifier: string;
  url: string;
  expires: Date;
  provider: NodemailerConfig;
  token: string;
  theme: any;
  request: Request;
}) {
  // Uses NextAuth's own provider transport (not the notification transporter),
  // but shares the Ìpínayò EmailLayout via the react-email templates.
  const { server, from } = provider;
  const transporter = createTransport(server);

  const invites = await findPendingInvitationsForEmail(email);
  const inviter = invites[0]?.inviterName ?? "Someone";

  const subject = invites.length
    ? invites.length === 1
      ? `${inviter} invited you to collaborate on Ìpínayò`
      : "You've been invited to collaborate on Ìpínayò"
    : "Sign in to Ìpínayò";

  const element = invites.length ? (
    <GroupInvitationEmail url={url} email={email} invites={invites} />
  ) : (
    <SignInEmail url={url} email={email} />
  );

  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);

  const result = await transporter.sendMail({
    to: email,
    from,
    subject,
    html,
    text,
  });

  const failed = result.rejected;
  if (failed.length) {
    throw new Error(
      `Email(s) (${failed.map(String).join(", ")}) could not be sent`,
    );
  }
}
