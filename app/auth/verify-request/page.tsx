import { ArrowLeft, Mail } from "lucide-react";
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

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/images/logo.png"
              alt="logo"
              width={200}
              height={80}
              className="h-12 w-auto"
            />
          </div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="font-display text-2xl">
            Check your email
          </CardTitle>
          <CardDescription className="text-center">
            We've sent a link to your email. Click the link in the email to
            continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center space-y-2">
            <p>The link will expire in 24 hours.</p>
            <p>If you don't see the email, please check your spam folder.</p>
          </div>

          <div className="pt-4">
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/auth/signin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to sign in
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
