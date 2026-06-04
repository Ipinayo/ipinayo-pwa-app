import { Button } from "@/components/ui/button";
import AnnouncementsList from "@/components/app/admin/notifications/announcements-list";
import AnnouncementsListSkeleton from "@/components/app/admin/notifications/announcements-list/index-skeleton";
import AnnouncementsStats from "@/components/app/admin/notifications/announcements-stats";
import AnnouncementsStatsSkeleton from "@/components/app/admin/notifications/announcements-stats/index-skeleton";
import Link from "next/link";
import { Plus } from "lucide-react";
import { SearchParams } from "@/types/utils";
import { Suspense } from "react";
import TypeFilter from "@/components/app/admin/notifications/type-filter";

export default async function NotificationsPage(
  props: Readonly<{ searchParams: SearchParams }>,
) {
  const filters = await props.searchParams;

  const type = (filters["type"] as string) || "all";
  const page = Number(filters["page"]) || 1;

  const searchKey = [type, page].join("-");

  return (
    <div className="max-w-full w-full space-y-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-display text-foreground">
            Notifications & Announcements
          </h2>
          <Button asChild>
            <Link href="/admin/notifications/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Announcement
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground mt-2">
          Create and manage platform announcements
        </p>
      </div>

      <Suspense fallback={<AnnouncementsStatsSkeleton />}>
        <AnnouncementsStats />
      </Suspense>

      <div className="flex flex-col sm:flex-row gap-4">
        <TypeFilter selected={type} />
      </div>

      <Suspense fallback={<AnnouncementsListSkeleton />} key={searchKey}>
        <AnnouncementsList type={type} page={page} />
      </Suspense>
    </div>
  );
}
