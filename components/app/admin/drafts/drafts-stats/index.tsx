import { BookOpen, FileClock, TrendingUp } from "lucide-react";

import { StatsCard } from "@/components/common/stats-card";
import { getDraftsStats } from "@/lib/actions/admin";

export default async function DraftsStats() {
  const stats = await getDraftsStats();

  const draftsStats = [
    {
      title: "Total Drafts",
      value: stats.totalDrafts,
      icon: BookOpen,
      color: "text-amber-500",
    },
    {
      title: "Old Drafts",
      value: stats.oldDrafts,
      icon: FileClock,
      color: "text-orange-500",
    },
    {
      title: "New Drafts This Month",
      value: stats.newDraftsThisMonth,
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      title: "New Drafts This Week",
      value: stats.newDraftsThisWeek,
      icon: TrendingUp,
      color: "text-green-500",
    },
  ];

  return (
    <div className="grid gap-4 xs:grid-cols-2 lg:grid-cols-4">
      {draftsStats.map((metric) => (
        <StatsCard key={metric.title} metric={metric} />
      ))}
    </div>
  );
}
