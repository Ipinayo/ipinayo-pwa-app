import {
  Bell,
  BookOpen,
  Eye,
  Globe,
  Lock,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getAdminDashboardStats } from "@/lib/actions/admin";

export default async function AdminDashboard() {
  const stats = await getAdminDashboardStats();

  const metricsCards = [
    {
      title: "Total Selections",
      value: stats.totalSelections,
      description: "Across all users",
      icon: BookOpen,
      href: "/admin/selections",
      color: "text-muted-foreground",
    },
    {
      title: "Total Public Selections",
      value: stats.totalPublicSelections,
      description: "Across all users",
      icon: Globe,
      href: "/admin/selections",
      color: "text-muted-foreground",
    },
    {
      title: "Total Private Selections",
      value: stats.totalPrivateSelections,
      description: "Across all users",
      icon: Lock,
      href: "/admin/selections",
      color: "text-muted-foreground",
    },
    {
      title: "Total Drafts",
      value: stats.totalDrafts,
      description: "Across all users",
      icon: BookOpen,
      href: "/admin/drafts",
      color: "text-amber-500",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: `${stats.newUsersThisMonth} new this month`,
      icon: Users,
      href: "/admin/users",
      color: "text-muted-foreground",
    },
    // {
    //   title: "Notifications Sent",
    //   value: stats.notificationsSent,
    //   description: "Total announcements",
    //   icon: Bell,
    //   href: "/admin/notifications",
    //   color: "text-cyan-500",
    // },
  ];

  return (
    <div className="max-w-full w-full space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-5 w-full justify-between">
          <h2 className="text-3xl font-display text-foreground">
            Admin Dashboard
          </h2>
          <Button size="lg" className="gap-2" asChild>
            <Link href="/admin/notifications/create">
              <Plus className="h-5 w-5" />
              Create Announcement
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground mt-2">Monitor and manage Ìpínayò</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metricsCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.title}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className={cn("h-4 w-4", metric.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
                <Link href={metric.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 px-2 text-xs"
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/admin/notifications/create">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Bell className="mr-2 h-4 w-4" />
                Create Announcement
              </Button>
            </Link>
            <Link href="/admin/activity">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Recent Activity
              </Button>
            </Link>
            <Link href="/admin/users?filter=new">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                View New Users
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
