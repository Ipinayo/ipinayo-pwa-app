"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ErrorPageProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  onRetry?: () => void;
  error?: Error;
}

export default function ErrorPage({
  title = "Something went wrong",
  showHomeButton = true,
  onRetry,
  error,
}: ErrorPageProps) {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-full w-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive h-6 w-6" />
          </div>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">{error?.message}</p>

          <div className="flex flex-col gap-2">
            <Button type="button" onClick={handleRetry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            {showHomeButton && (
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
