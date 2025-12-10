import { BookOpen, FileText, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import DraftList from "@/components/app/dashboard/draft-list";
import Link from "next/link";
import MassSelectionListSkeleton from "@/components/app/mass-selections/mass-selection-list/index-skeleton";
import SelectionsList from "@/components/app/dashboard/selections-list";
import Statistics from "@/components/app/dashboard/statistics";
import StatisticsSkeleton from "@/components/app/dashboard/statistics/index-skeleton";
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) redirect("/signin");

  return (
    <div className="max-w-full w-full">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-display text-foreground mb-2">
          Welcome back, {session.user.name?.split(" ")[0] || session.user.email}
          !
        </h2>
        <p className="text-muted-foreground">
          Plan and organize your liturgical music.
        </p>
      </div>

      <Suspense fallback={<StatisticsSkeleton />}>
        <Statistics />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Tabs defaultValue="selections" className="lg:col-span-2 space-y-6">
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
            <div className="flex justify-between items-center">
              <h3 className="text-lg ">My Liturgical Selections</h3>
              <Link href="/dashboard/liturgical-selections">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            <Suspense
              fallback={
                <MassSelectionListSkeleton className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3" />
              }
            >
              <SelectionsList />
            </Suspense>
          </TabsContent>

          <TabsContent value="drafts" className="space-y-4">
            {/* <div className="flex justify-between items-center">
              <h3 className="text-lg">My Drafts</h3>
              <Link href="/dashboard/drafts">
                <Button variant="outline" size="sm">
                  View all
                </Button>
              </Link>
            </div>

            <div className="space-y-4"> */}
            <Suspense fallback={<div>Loading drafts...</div>}>
              <DraftList />
            </Suspense>
            {/* </div> */}
          </TabsContent>
        </Tabs>

        <Card className="lg:col-span-1 border-2 border-dashed border-primary/20 bg-linear-to-br from-primary/5 to-transparent h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              My Templates
            </CardTitle>
            <CardDescription>Reusable mass selection templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Coming Soon Message */}
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-6 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <h4 className="font-semibold text-sm mb-2">Coming Soon</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Save your favorite mass selections as reusable templates.
                Perfect for recurring liturgies and your preferred musical
                styles.
              </p>
            </div>

            {/* Feature Preview */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Upcoming features:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Create templates from existing selections</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Share templates with other users</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Quick-start new selections from templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Template library with community contributions</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
