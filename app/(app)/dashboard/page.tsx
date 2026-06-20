import { Activity, BookOpen, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CreateSelectionTrigger from "@/components/common/create-selection-trigger";
import DraftList from "@/components/app/dashboard/draft-list";
import DraftListSkeleton from "@/components/app/dashboard/draft-list/index-skeleton";
import RecentActivities from "@/components/app/dashboard/recent-activities";
import RecentActivitiesSkeleton from "@/components/app/dashboard/recent-activities/index-skeleton";
import SelectionsList from "@/components/app/dashboard/selections-list";
import SelectionsListSkeleton from "@/components/app/dashboard/selections-list/index-skeleton";
import SharedWithMe from "@/components/app/dashboard/shared-with-me";
import Statistics from "@/components/app/dashboard/statistics";
import StatisticsSkeleton from "@/components/app/dashboard/statistics/index-skeleton";
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  await requireAuth(`/dashboard`);

  return (
    <div className="max-w-full w-full">
      {/* Welcome Section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between assistant-open:lg:flex-col assistant-open:xl:flex-row">
        <div>
          <h2 className="text-3xl font-display text-foreground">
            Welcome Back
          </h2>
          <p className="text-muted-foreground mt-2">
            Plan and organize your liturgical music.
          </p>
        </div>
        <CreateSelectionTrigger />
      </div>

      <Suspense fallback={<StatisticsSkeleton />}>
        <Statistics />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-3 mb-8 assistant-open:lg:grid-cols-1 assistant-open:xl:grid-cols-3">
        <Tabs
          defaultValue="selections"
          className="lg:col-span-2 space-y-6 min-w-0"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="selections" className="gap-2">
              <BookOpen className="h-4 w-4" />
              My Selections
            </TabsTrigger>
            <TabsTrigger value="drafts" className="gap-2">
              <BookOpen className="h-4 w-4 text-amber-500" />
              My Drafts
            </TabsTrigger>
            <TabsTrigger value="shared" className="gap-2">
              <Users className="h-4 w-4" />
              Shared
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

          <TabsContent value="shared" className="space-y-4">
            <Suspense fallback={<SelectionsListSkeleton />}>
              <SharedWithMe />
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
    </div>
  );
}
