"use client";

import ErrorPage from "@/components/common/error-page";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      title="Oops! Something went wrong"
      onRetry={reset}
      error={error}
    />
  );
}
