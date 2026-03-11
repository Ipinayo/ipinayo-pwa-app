import { Activity, BookOpen, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import DraftList from "@/components/app/dashboard/draft-list";
import DraftListSkeleton from "@/components/app/dashboard/draft-list/index-skeleton";
import Link from "next/link";
import { PushNotificationPrompt } from "@/components/push-notification-prompt";
import RecentActivities from "@/components/app/dashboard/recent-activities";
import RecentActivitiesSkeleton from "@/components/app/dashboard/recent-activities/index-skeleton";
import SelectionsList from "@/components/app/dashboard/selections-list";
import SelectionsListSkeleton from "@/components/app/dashboard/selections-list/index-skeleton";
import Statistics from "@/components/app/dashboard/statistics";
import StatisticsSkeleton from "@/components/app/dashboard/statistics/index-skeleton";
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  await requireAuth(`/dashboard`);

  return (
    <div className="max-w-full w-full">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-5 w-full justify-between">
          <h2 className="text-3xl font-display text-foreground">
            Welcome Back
          </h2>
          <Button size="lg" className="gap-2" asChild>
            <Link href="/liturgical-selections/new">
              <Plus className="h-5 w-5" />
              Create Selection
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground mt-2">
          Plan and organize your liturgical music.
        </p>
      </div>

      <Suspense fallback={<StatisticsSkeleton />}>
        <Statistics />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Tabs
          defaultValue="selections"
          className="lg:col-span-2 space-y-6 min-w-0"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="selections" className="gap-2">
              <BookOpen className="h-4 w-4" />
              My Selections
            </TabsTrigger>
            <TabsTrigger value="drafts" className="gap-2">
              <BookOpen className="h-4 w-4 text-amber-500" />
              My Drafts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="selections" className="space-y-4">
            <Suspense fallback={<SelectionsListSkeleton />}>
              <SelectionsList />
            </Suspense>
          </TabsContent>

          <TabsContent value="drafts" className="space-y-4">
            <Suspense fallback={<DraftListSkeleton />}>
              <DraftList />
            </Suspense>
          </TabsContent>
        </Tabs>

        <Card className="lg:col-span-1 h-fit min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Suspense fallback={<RecentActivitiesSkeleton />}>
              <RecentActivities />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <PushNotificationPrompt />
    </div>
  );
}
