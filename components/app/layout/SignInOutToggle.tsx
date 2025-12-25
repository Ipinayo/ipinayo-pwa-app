"use client";

import SignInButton from "./SignInButton";
import SignoutButton from "./SignoutButton";
import { useSession } from "next-auth/react";

export default function SignInOutToggle({
  className,
  textClassName,
}: {
  className?: string;
  textClassName?: string;
}) {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <SignoutButton className={className} textClassName={textClassName} />
    );
  }

  return (
    <SignInButton
      variant="outline"
      className={className}
      textClassName={textClassName}
    />
  );
}
