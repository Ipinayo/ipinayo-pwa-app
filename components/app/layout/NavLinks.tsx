"use client";

import {
  Activity,
  Bell,
  BookOpen,
  ChevronRight,
  FileClock,
  Home,
  LayoutDashboard,
  Library,
  Settings,
  User,
  Users,
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
  activeClassName?: string; // Optional classes for active state
  children?: Route[]; // For collapsible items like settings
}

interface NavLinksProps {
  adminNav: boolean;
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
  collapsibleChevronClassName?: string;
  collapsibleContentClassName?: string;
}

const RouteLink = ({
  route,
  itemClassName,
  iconClassName,
  labelClassName,
}: {
  route: Route;
  itemClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
}) => {
  return (
    <Link
      key={route.href}
      href={route.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
        route.active
          ? route.activeClassName || "primary-gradient"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        itemClassName,
      )}
    >
      <route.icon className={cn("h-4 w-4", iconClassName)} />
      <span className={cn("truncate", labelClassName)}>{route.label}</span>
    </Link>
  );
};

export default function NavLinks({
  adminNav,
  className,
  itemClassName,
  iconClassName,
  labelClassName,
  collapsibleChevronClassName,
  collapsibleContentClassName,
}: NavLinksProps) {
  const pathname = usePathname();

  const routes: Route[] = adminNav
    ? [
        {
          label: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          active: pathname === "/admin",
        },
        {
          label: "Users",
          href: "/admin/users",
          icon: Users,
          active: pathname.startsWith("/admin/users"),
        },
        {
          label: "Selections",
          href: "/admin/selections",
          icon: BookOpen,
          active: pathname.startsWith("/admin/selections"),
        },
        {
          label: "Drafts",
          href: "/admin/drafts",
          icon: FileClock,
          active: pathname.startsWith("/admin/drafts"),
        },
        {
          label: "Notifications",
          href: "/admin/notifications",
          icon: Bell,
          active: pathname.startsWith("/admin/notifications"),
        },
        {
          label: "Activity Logs",
          href: "/admin/activity",
          icon: Activity,
          active: pathname.startsWith("/admin/activity"),
        },
        {
          label: "Settings",
          href: "/admin/settings",
          icon: Settings,
          active: pathname.startsWith("/admin/settings"),
        },
      ]
    : [
        {
          href: "/",
          label: "Home",
          icon: Home,
          active: pathname === "/" || pathname === "",
        },
        {
          href: "/liturgical-selections",
          label: "Liturgical Selections",
          icon: BookOpen,
          active: pathname.startsWith("/liturgical-selections"),
        },
        {
          href: "/dashboard",
          label: "My Dashboard",
          icon: Library,
          active: pathname === "/dashboard",
        },
        {
          href: "/profile",
          label: "My Profile",
          icon: User,
          active: pathname === "/profile",
        },
        {
          href: "/settings",
          label: "Settings",
          icon: Settings,
          active: pathname.startsWith("/settings"),
          children: [
            {
              href: "/settings/profile",
              label: "Profile",
              icon: User,
              active: pathname.startsWith("/settings/profile"),
              activeClassName: "font-semibold",
            },
            {
              href: "/settings/notifications",
              label: "Notifications",
              icon: Bell,
              active: pathname.startsWith("/settings/notifications"),
              activeClassName: "font-semibold",
            },
          ],
        },
      ];

  return (
    <div className="px-3 py-2">
      <div className={cn("space-y-1.5 ", className)}>
        {routes.map((route) =>
          route.children ? (
            <Collapsible key={route.href} className="w-full">
              <CollapsibleTrigger
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  route.active
                    ? route.activeClassName || "primary-gradient"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  itemClassName,
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
                    collapsibleChevronClassName,
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent
                className={cn(
                  "space-y-1 pl-5 pt-1",
                  collapsibleContentClassName,
                )}
                aria-describedby="navigation links"
              >
                {route.children.map((child) => (
                  <RouteLink
                    key={child.href}
                    route={child}
                    labelClassName={labelClassName}
                    itemClassName={itemClassName}
                    iconClassName={iconClassName}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <RouteLink
              key={route.href}
              route={route}
              labelClassName={labelClassName}
              itemClassName={itemClassName}
              iconClassName={iconClassName}
            />
          ),
        )}
      </div>
    </div>
  );
}
