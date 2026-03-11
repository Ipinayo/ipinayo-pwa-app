import { Bell, TrendingUp } from "lucide-react";

import { StatsCard } from "@/components/common/stats-card";
import { getAnnouncementsStatsAction } from "@/lib/actions/admin";

export default async function AnnouncementsStats() {
  const stats = await getAnnouncementsStatsAction();

  const metrics = [
    {
      title: "Total Announcements",
      value: stats.total,
      icon: Bell,
      color: "text-primary",
    },
    {
      title: "This Month",
      value: stats.thisMonth,
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      title: "This Week",
      value: stats.thisWeek,
      icon: TrendingUp,
      color: "text-green-500",
    },
  ];

  return (
    <div className="grid gap-4 xs:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <StatsCard key={metric.title} metric={metric} />
      ))}
    </div>
  );
}
