"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";
import { useActionState } from "react";

export default function SignoutButton({
  className,
  textClassName,
}: {
  className?: string;
  textClassName?: string;
}) {
  const [_, logoutAction, logoutIsPending] = useActionState(logout, undefined);

  return (
    <form action={logoutAction} className="flex w-full justify-start">
      <Button
        type="submit"
        variant="outline"
        className={cn("flex w-full justify-start", className)}
        size="sm"
        disabled={logoutIsPending}
      >
        <LogOut className="mr-2 h-4 w-4" />
        <span className={cn("", textClassName)}>Sign Out</span>
      </Button>
    </form>
  );
}
