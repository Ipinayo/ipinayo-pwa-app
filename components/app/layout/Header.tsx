"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu } from "lucide-react";
import SideNav from "./SideNav";
import SignoutButton from "./SignoutButton";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: session } = useSession();

  const user = session?.user;

  return (
    <div className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile menu trigger */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0"
            aria-describedby="side navigation"
          >
            <SheetTitle className="sr-only">Side Navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Side Navigation
            </SheetDescription>
            <SideNav isMobileMenuOpen={mobileMenuOpen} />
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center">
          <img
            src="/images/logo.png"
            alt="Ipinayo Logo"
            className="h-11 w-auto"
          />
        </Link>

        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm font-medium md:inline-block">
                {user.name}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar>
                      <AvatarImage
                        src={user.image || "/placeholder.svg"}
                        alt={user?.name || ""}
                      />
                      <AvatarFallback>
                        {user.name ||
                          "A"
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <SignoutButton className="border-none p-0 has-[>svg]:px-0" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
