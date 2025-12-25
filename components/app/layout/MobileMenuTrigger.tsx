"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import SideNav from "./SideNav";
import { useState } from "react";

export default function MobileMenuTrigger({ adminNav}: { adminNav: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
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
        <SheetDescription className="sr-only">Side Navigation</SheetDescription>
        <SideNav isMobileMenuOpen={mobileMenuOpen} adminNav={adminNav} />
      </SheetContent>
    </Sheet>
  );
}
