"use client";

import { Loader2, Mail } from "lucide-react";
import { emailAuthenticate, googleAuthenticate } from "@/lib/actions/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useActionState } from "react";

export default function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [_, googleAction, googleAuthIsPending] = useActionState(
    googleAuthenticate,
    undefined,
  );
  const [res, emailAction, emailAuthIsPending] = useActionState(
    emailAuthenticate,
    undefined,
  );

  return (
    <div className="space-y-6">
      <form action={emailAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email address
          </label>
          <Input
            name="email"
            placeholder="Enter your email"
            error={res?.success === false ? res.message : undefined}
            aria-invalid={res?.success === false}
          />
        </div>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={emailAuthIsPending}
        >
          {emailAuthIsPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              Sending sign in link to email...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5 mr-3" />
              Sign in with email
            </>
          )}
        </Button>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <form action={googleAction}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <Button
          className="w-full bg-transparent"
          size="lg"
          variant="outline"
          type="submit"
          disabled={googleAuthIsPending}
        >
          {googleAuthIsPending ? (
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Sign in with Google
        </Button>
      </form>
    </div>
  );
}
