"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

/** Contact link pinned to the bottom utility zone of the nav. Styled like the
 *  main nav links (ghost), but its active state is a subtle secondary highlight
 *  rather than the primary gradient the top-level routes use. */
export default function ContactNavLink({
  className,
  iconClassName,
  textClassName,
}: {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}) {
  const pathname = usePathname();
  const active = pathname === "/contact";

  return (
    <Link
      href="/contact"
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
        active
          ? "bg-secondary text-secondary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      <Mail className={cn("h-4 w-4", iconClassName)} />
      <span className={cn("truncate", textClassName)}>Contact Us</span>
    </Link>
  );
}
