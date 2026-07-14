"use client";

import {
  CONTACT_MESSAGE_MAX,
  type ContactInput,
  contactSchema,
} from "@/types/schemas/contact";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessage } from "@/lib/actions/contact";
import { withToast } from "@/lib/with-toast";
import { zodResolver } from "@hookform/resolvers/zod";

export function ContactForm({
  isAuthenticated,
  senderName,
  senderEmail,
}: Readonly<{
  isAuthenticated: boolean;
  senderName?: string | null;
  senderEmail?: string | null;
}>) {
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      // Signed-in senders don't fill name/email (taken from the session), so
      // they stay undefined and pass the schema's `.optional()`. Signed-out
      // senders get "" — rendered fields that must satisfy min-length / email.
      name: isAuthenticated ? undefined : "",
      email: isAuthenticated ? undefined : "",
      subject: "",
      message: "",
    },
  });

  const pending = form.formState.isSubmitting;
  const messageLength = form.watch("message")?.trim().length ?? 0;

  const handleSubmit = async (data: ContactInput) => {
    const input: ContactInput = { message: data.message };
    if (data.subject?.trim()) input.subject = data.subject.trim();
    if (!isAuthenticated) {
      input.name = data.name;
      input.email = data.email;
    }

    const { error } = await withToast(() => sendContactMessage(input), {
      loading: "Sending your message…",
      success: "Message sent — we'll be in touch.",
    });

    if (!error) form.reset();
  };

  return (
    <FormProvider {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        {isAuthenticated ? (
          <p className="text-muted-foreground text-sm">
            Sending as{" "}
            <span className="text-foreground font-medium">
              {senderName || senderEmail}
            </span>
            {senderName && senderEmail ? ` (${senderEmail})` : null}.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Your name"
                      disabled={pending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      type="email"
                      placeholder="you@example.com"
                      disabled={pending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Subject{" "}
                <span className="text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="What's this about?"
                  maxLength={150}
                  disabled={pending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="How can we help?"
                  className="min-h-40"
                  maxLength={CONTACT_MESSAGE_MAX}
                  disabled={pending}
                />
              </FormControl>
              {form.formState.errors.message ? (
                <FormMessage />
              ) : (
                <p className="text-muted-foreground text-xs">
                  {messageLength}/{CONTACT_MESSAGE_MAX}
                </p>
              )}
            </FormItem>
          )}
        />

        <Button type="submit" disabled={pending} className="gap-1.5">
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Mail className="size-4" /> Send message
            </>
          )}
        </Button>
      </form>
    </FormProvider>
  );
}
