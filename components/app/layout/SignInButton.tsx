import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignInButton({
  className,
  textClassName,
  variant = "ghost",
}: {
  className?: string;
  textClassName?: string;
  variant?: "ghost" | "outline" | "default";
}) {
  return (
    <Link href="/signin">
      <Button
        variant={variant}
        size="sm"
        className={cn("flex w-full justify-start", className)}
      >
        <LogIn className="mr-2 h-4 w-4" />
        <span className={cn("", textClassName)}>Sign In</span>
      </Button>
    </Link>
  );
}
