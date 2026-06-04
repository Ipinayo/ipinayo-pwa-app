import { Bell, BookOpen, Eye, Plus, UserPlus, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StatsCard } from "@/components/common/stats-card";
import { getAdminDashboardStats } from "@/lib/actions/admin";

export default async function AdminDashboard() {
  const stats = await getAdminDashboardStats();

  const metricsCards = [
    {
      title: "Total Selections",
      value: stats.totalSelections,
      description: `${stats.newSelectionsThisWeek} new this week`,
      icon: BookOpen,
      href: "/admin/selections",
      color: "text-muted-foreground",
    },
    {
      title: "Total Drafts",
      value: stats.totalDrafts,
      description: `${stats.newDraftsThisWeek} new this week`,
      icon: BookOpen,
      href: "/admin/drafts",
      color: "text-amber-500",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: `${stats.newUsersThisWeek} new this week`,
      icon: Users,
      href: "/admin/users",
      color: "text-primary",
    },
    {
      title: "Broadcasts Sent",
      value: stats.notificationsSent,
      description: "Total announcements",
      icon: Bell,
      href: "/admin/notifications",
      color: "text-cyan-500",
    },
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

      <div className="grid gap-4 xs:grid-cols-2 lg:grid-cols-4">
        {metricsCards.map((metric) => (
          <StatsCard key={metric.title} metric={metric} />
        ))}
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
