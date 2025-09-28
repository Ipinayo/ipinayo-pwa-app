"use client";

import {
  BookOpen,
  ChevronRight,
  Home,
  Library,
  Music,
  Settings,
  Upload,
  User,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface Route {
  href: string;
  label: string;
  icon: React.ElementType;
  active?: boolean;
  children?: Route[]; // For collapsible items like settings
}

interface NavLinksProps {
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
  collapsibleChevronClassName?: string;
  collapsibleContentClassName?: string;
}

export default function NavLinks({
  className,
  itemClassName,
  iconClassName,
  labelClassName,
  collapsibleChevronClassName,
  collapsibleContentClassName,
}: NavLinksProps) {
  const pathname = usePathname();

  const routes: Route[] = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/" || pathname === "",
    },
    {
      href: "/mass-selections",
      label: "Mass Selections",
      icon: BookOpen,
      active:
        pathname === "/mass-selections" ||
        pathname.startsWith("/mass-selections/"),
    },
    {
      href: "/dashboard",
      label: "My Dashboard",
      icon: Library,
      active: pathname === "/dashboard",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings" || pathname.startsWith("/settings/"),
      children: [
        {
          href: "/profile",
          label: "Profile",
          icon: User,
        },
        {
          href: "/account",
          label: "Account",
          icon: Settings,
        },
      ],
    },
  ];

  const RouteLink = ({ route }: { route: Route }) => {
    return (
      <Link
        key={route.href}
        href={route.href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
          route.active
            ? "from-primary-light to-primary text-primary-foreground bg-gradient-to-r"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          itemClassName
        )}
      >
        <route.icon className={cn("h-4 w-4", iconClassName)} />
        <span className={cn("truncate", labelClassName)}>{route.label}</span>
      </Link>
    );
  };

  return (
    <div className="px-3 py-2">
      <div className={cn("space-y-1.5", className)}>
        {routes.map((route) =>
          route.children ? (
            <Collapsible key={route.href} className="w-full">
              <CollapsibleTrigger
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  route.active
                    ? "from-primary-light to-primary text-primary-foreground bg-gradient-to-r"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  itemClassName
                )}
              >
                <div className="flex items-center gap-3">
                  <route.icon className={cn("h-4 w-4", iconClassName)} />
                  <span className={cn("truncate", labelClassName)}>
                    {route.label}
                  </span>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    collapsibleChevronClassName
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent
                className={cn(
                  "space-y-1 pl-5 pt-1",
                  collapsibleContentClassName
                )}
              >
                {route.children.map((child) => (
                  <RouteLink key={child.href} route={child} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <RouteLink key={route.href} route={route} />
          )
        )}
      </div>
    </div>
  );
}
