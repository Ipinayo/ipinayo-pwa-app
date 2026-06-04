import {
  formatDateFromNow,
  getActivityEntity,
  getActivityEvent,
} from "@/lib/utils";

import { Activity } from "lucide-react";
import ActivityIcon from "@/components/common/activity-icon";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getMyActivities } from "@/lib/actions/activity";

export default async function RecentActivities() {
  const recentActivities = await getMyActivities({
    page: 1,
    limit: 5,
  });

  if (recentActivities.activities.length === 0) {
    return (
      <div className="text-center py-6">
        <Activity className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-xs text-muted-foreground">No activities yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {recentActivities.activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-muted">
              <ActivityIcon
                event={activity.activity.event}
                className="h-4 w-4"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {getActivityEntity(
                  activity.activity.event,
                  activity.metadata ?? activity.activity.metadata,
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {getActivityEvent(activity.activity.event)}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDateFromNow(activity.createdAt)}
            </div>
          </div>
        ))}
      </div>
      {recentActivities.pagination.total > 5 && (
        <Button asChild variant="outline" size="sm" className="w-full mt-4">
          <Link href="/dashboard/activities">View all activities →</Link>
        </Button>
      )}
    </>
  );
}
