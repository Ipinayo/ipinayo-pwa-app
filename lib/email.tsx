import { SignInEmail } from "@/emails/auth/sign-in";
import type { NodemailerConfig } from "next-auth/providers/nodemailer";
import { createTransport } from "nodemailer";
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
  // but shares the Ìpínayò EmailLayout via the SignInEmail react-email template.
  const { server, from } = provider;
  const transporter = createTransport(server);

  const element = <SignInEmail url={url} email={email} />;
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);

  const result = await transporter.sendMail({
    to: email,
    from,
    subject: "Sign in to Ìpínayò",
    html,
    text,
  });

  const failed = result.rejected;
  if (failed.length) {
    throw new Error(`Email(s) (${failed.map(String).join(", ")}) could not be sent`);
  }
}
