import ContactNavLink from "./ContactNavLink";
import LazyThemeToggle from "./LazyThemeToggle";
import NavLinks from "./NavLinks";
import SignInOutToggle from "./SignInOutToggle";
import { cn } from "@/lib/utils";

interface SideNavProps {
  isMobileMenuOpen?: boolean;
  adminNav?: boolean;
}

export default function SideNav({
  isMobileMenuOpen,
  adminNav = false,
}: SideNavProps) {
  return (
    <>
      {/* Mobile Navigation - In TopNav component */}
      <div
        className={cn(
          " h-full ",
          isMobileMenuOpen ? "flex flex-col py-10" : "hidden",
        )}
      >
        <NavLinks adminNav={adminNav} />
        <div className="border-border mt-auto space-y-2 border-t px-3 py-4">
          <ContactNavLink />
          <LazyThemeToggle className="w-full justify-start py-2" />
          <SignInOutToggle />
        </div>
      </div>

      {/* Desktop Navigation - Static with hover expand */}
      <div className="bg-background group fixed bottom-0 left-0 top-14 z-30 hidden w-16 border-r transition-all duration-300 ease-in-out hover:w-64 md:block">
        <div className="flex h-full flex-col py-4">
          <NavLinks
            adminNav={adminNav}
            iconClassName="min-w-4"
            itemClassName="transition-all"
            labelClassName="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            collapsibleChevronClassName="opacity-0 duration-300 group-hover:opacity-100"
            collapsibleContentClassName="hidden group-hover:block"
          />

          <div className="border-border mt-auto space-y-2 border-t px-3 py-4">
            <ContactNavLink
              iconClassName="min-w-4"
              textClassName="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <div className="flex justify-center transition-all group-hover:justify-start">
              <LazyThemeToggle
                className="w-full justify-start py-2 group-hover:flex"
                textClassName="hidden group-hover:inline"
              />
            </div>
            <SignInOutToggle textClassName="hidden group-hover:inline" />
          </div>
        </div>
      </div>
    </>
  );
}
