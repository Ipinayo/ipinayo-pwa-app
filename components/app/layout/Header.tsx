import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import AdminAppToggle from "./AdminAppToggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import MobileMenuTrigger from "./MobileMenuTrigger";
import SignInButton from "./SignInButton";
import SignoutButton from "./SignoutButton";
import UserAvatar from "@/components/common/user-avatar";
import { getUser } from "@/lib/actions/user";
import { isAdmin } from "@/lib/utils";

export default async function Header({
  adminNav = false,
}: {
  adminNav?: boolean;
}) {
  const user = await getUser();

  return (
    <div className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        <MobileMenuTrigger adminNav={adminNav} />

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
              {isAdmin(user.userRole) && <AdminAppToggle />}
              <span className="hidden text-sm font-medium md:inline-block">
                {user.name}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <UserAvatar user={user} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {user.email}
                      </p>
                      {user.profile?.headline && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {user.profile.headline}
                        </p>
                      )}
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
            <SignInButton />
          )}
        </div>
      </div>
    </div>
  );
}
