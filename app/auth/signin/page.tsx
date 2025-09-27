import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Image from "next/image";
import LoginForm from "@/components/login-form";

type SearchParams = Promise<{ callbackUrl: string | undefined }>;

export default async function SignInPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;

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
          <CardTitle className="font-display text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your Mass selections and continue sharing joy
            through music.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm callbackUrl={searchParams.callbackUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
