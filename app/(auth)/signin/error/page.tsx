import { AlertCircle, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { SearchParams } from "@/types/utils";

// Map common AuthJS error codes to user-friendly messages
const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access was denied. You do not have permission to sign in.",
  Verification:
    "The verification link has expired or has already been used. Please request a new login link.",
  EmailSignin: "Failed to send the verification email. Please try again.",
  OAuthSignin: "There was an error connecting to Google. Please try again.",
  OAuthCallback: "Failed to complete Google sign-in. Please try again.",
  OAuthAccountNotLinked:
    "This email is already registered with a different sign-in method. Please use your original sign-in method.",
  EmailCreateAccount:
    "Could not create your account. Please try again or contact support.",
  Callback: "An error occurred during the sign-in process. Please try again.",
  SessionRequired: "You must be signed in to access this page.",
  SessionExpired: "Your session has expired. Please sign in again.",
  LinkExpired: "The verification link has expired. Please request a new one.",
  Default:
    "An unexpected error occurred during authentication. Please try again.",
};

export default async function AuthErrorPage(props: {
  searchParams: SearchParams;
}) {
  const errors = await props.searchParams;
  const error = errors["error"];

  const displayError = error
    ? errorMessages[error]
    : "An unexpected error occurred during authentication.";

  return (
    <div className="flex min-h-full w-full flex-col">
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/images/logo.png"
                alt="logo"
                width={200}
                height={80}
                className="h-12 w-auto"
              />
            </div>
            <div className="flex justify-center mb-4">
              <div className="bg-destructive/10 p-3 rounded-full">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
            <CardDescription>
              Something went wrong during the login process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-semibold text-sm mb-2">Error Details:</p>
              <p className="text-sm text-muted-foreground">{displayError}</p>
            </div>
            <div className="space-y-3">
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link href="/signin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Login
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full bg-transparent"
              >
                <Link href="/">Go to Home</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              If you continue to experience issues, please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
