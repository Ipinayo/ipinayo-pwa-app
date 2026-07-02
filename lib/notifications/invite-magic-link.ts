import "server-only";

import { signIn } from "@/auth";

/**
 * Send each invited email a NextAuth magic link. The link is both the invite and
 * the sign-in: clicking it authenticates the person (creating their account if
 * needed), which claims their pending invitations. `sendVerificationRequest`
 * swaps in invite wording when the address has pending invites.
 *
 * `redirect: false` because the caller (a server action run by the *inviting*
 * manager) must not be redirected — we only want the verification email sent.
 * Per-email failures are logged, not thrown: the invitation row already exists,
 * so a failed send is recoverable, and one bad address must not abort the rest.
 *
 * NOT a `"use server"` action — it must never be a client-callable endpoint, or
 * anyone could spray magic links at arbitrary addresses.
 */
export async function sendInviteMagicLinks(
  emails: string[],
  redirectTo: string,
) {
  await Promise.all(
    emails.map(async (email) => {
      try {
        await signIn("email", { email, redirectTo, redirect: false });
      } catch (error) {
        console.error(`Failed to send invite magic link to ${email}:`, error);
      }
    }),
  );
}
