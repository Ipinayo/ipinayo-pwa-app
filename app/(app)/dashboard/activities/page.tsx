import { Activity, Clock, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatDateFromNow,
  getActivityEntity,
  getActivityEvent,
  getCallbackUrl,
} from "@/lib/utils";

import ActivityIcon from "@/components/common/activity-icon";
import BackButton from "@/components/common/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SearchParams } from "@/types/utils";
import { UrlPagination } from "@/components/common/url-pagination";
import { getMyActivities } from "@/lib/actions/activity";
import { requireAuth } from "@/lib/auth";

export default async function ActivitiesPage(props: {
  searchParams: SearchParams;
}) {
  const filters = await props.searchParams;

  await requireAuth(getCallbackUrl("/dashboard/activities", filters));

  const page = Number(filters["page"]) || 1;

  const activitiesRes = await getMyActivities({ page });
  const activities = activitiesRes.activities;
  const pagination = activitiesRes.pagination;

  return (
    <div className="mx-auto max-w-2xl w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <BackButton fallback="/dashboard" />
        <div>
          <h2 className="text-3xl font-display text-foreground">
            All Activities
          </h2>
          <p className="text-muted-foreground mt-1">
            Your complete activity history and notifications
          </p>
        </div>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
            {page === 1 ? (
              <>
                <h3 className="text-lg font-semibold mb-2">
                  No Activities Yet
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Your activities will appear here as you create and manage your
                  Liturgical selections
                </p>
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/liturgical-selections/new">
                    {" "}
                    <Plus className="h-5 w-5" />
                    Create Your First Selection
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">No Activities</h3>
                <p className="text-muted-foreground text-center mb-4">
                  There are no activities to display on this page. Try going
                  back to the previous page or check your activity history on
                  the dashboard.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <Card
              key={activity.id}
              className="hover:bg-muted/50 transition-colors py-3"
            >
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-muted">
                    <ActivityIcon
                      event={activity.event}
                      className="h-5 w-5 pt-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {getActivityEntity(activity.event, activity.metadata)}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getActivityEvent(activity.event)}
                        </p>
                      </div>

                      <Badge variant="outline" className="shrink-0 capitalize">
                        {activity.entityType}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDateFromNow(activity.createdAt)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-8">
        <UrlPagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
        />
      </div>
    </div>
  );
}
