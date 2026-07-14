import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ContactForm } from "@/components/app/contact/contact-form";
import type { Metadata } from "next";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Contact Us — Ìpínayò",
  description: "Get in touch with the Ìpínayò team.",
};

export default async function ContactPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl">Contact us</h1>
        <p className="text-muted-foreground">
          Questions, feedback, or need a hand? Send us a message and we'll get
          back to you.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Send a message</CardTitle>
          <CardDescription>
            We usually respond within a couple of days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm
            isAuthenticated={!!user}
            senderName={user?.name}
            senderEmail={user?.email}
          />
        </CardContent>
      </Card>
    </div>
  );
}
