import { BookOpen, Globe, Lock, TrendingUp } from "lucide-react";

import { StatsCard } from "@/components/common/stats-card";
import { getSelectionsStats } from "@/lib/actions/admin";

export default async function SelectionsStats() {
  const stats = await getSelectionsStats();

  const selectionsStats = [
    {
      title: "Total Selections",
      value: stats.totalSelections,
      icon: BookOpen,
    },
    {
      title: "Total Private Selections",
      value: stats.totalPrivateSelections,
      icon: Lock,
    },
    {
      title: "Total Public Selections",
      value: stats.totalPublicSelections,
      icon: Globe,
    },
    {
      title: "New Selections This Month",
      value: stats.newSelectionsThisMonth,
      icon: TrendingUp,
    },
    {
      title: "New Selections This Week",
      value: stats.newSelectionsThisMonth,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {selectionsStats.map((metric) => (
        <StatsCard key={metric.title} metric={metric} />
      ))}
    </div>
  );
}
