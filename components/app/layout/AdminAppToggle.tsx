"use client";

import { Home, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminAppToggle() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin"))
    return (
      <Link href="/">
        <Button variant={"outline"} className="truncate flex-1">
          <Home className="h-4 w-4" />
          <span className="hidden text-sm font-medium md:inline-block">
            Back to App
          </span>
        </Button>
      </Link>
    );

  return (
    <Link href="/admin">
      <Button variant={"outline"} className="truncate flex-1">
        <LayoutDashboard className="h-4 w-4" />
        <span className="hidden text-sm font-medium md:inline-block">
          Admin Dashboard
        </span>
      </Button>
    </Link>
  );
}
