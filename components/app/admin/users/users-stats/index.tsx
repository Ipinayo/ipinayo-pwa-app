import { ShieldUser, TrendingUp, Users } from "lucide-react";

import { StatsCard } from "@/components/common/stats-card";
import { getUsersStats } from "@/lib/actions/admin";

export default async function UsersStats() {
  const stats = await getUsersStats();

  const usersStats = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: "Administrators",
      value: stats.totalAdmins,
      icon: ShieldUser,
    },
    {
      title: "New Users This Month",
      value: stats.newUsersThisMonth,
      icon: TrendingUp,
    },
    {
      title: "New Users This Week",
      value: stats.newUsersThisWeek,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 xs:grid-cols-2 lg:grid-cols-4">
      {usersStats.map((metric) => (
        <StatsCard key={metric.title} metric={metric} />
      ))}
    </div>
  );
}
