import { Bell, CheckCircle, Mail, Megaphone, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UrlPagination } from "@/components/common/url-pagination";
import { formatDateFromNow } from "@/lib/utils";
import { getAnnouncementsAction } from "@/lib/actions/admin";

const TYPE_COLORS: Record<string, string> = {
  feature: "bg-blue-500",
  maintenance: "bg-orange-500",
  general: "bg-purple-500",
};

const TARGET_LABELS: Record<string, string> = {
  all: "All Users",
  admins: "Administrators Only",
  specific: "Specific Users",
};

export default async function AnnouncementsList({
  type,
  page,
}: {
  type?: string;
  page: number;
}) {
  const { announcements, pagination } = await getAnnouncementsAction({
    page,
    type,
  });

  if (announcements.length === 0) {
    return (
      <Card className="text-center">
        <CardContent className="py-12">
          <Megaphone className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Announcements Yet</h3>
          <p className="text-muted-foreground mb-6">
            {type && type !== "all"
              ? "No announcements match the selected filter."
              : "Create your first announcement to notify platform users."}
          </p>
          <Button asChild>
            <Link href="/admin/notifications/create">Create Announcement</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Announcements ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="flex items-start justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium">{announcement.title}</h3>
                    <Badge
                      className={
                        TYPE_COLORS[announcement.type] ?? "bg-muted-foreground"
                      }
                    >
                      {announcement.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {announcement.message}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {/* Channels */}
                    <div className="flex items-center gap-1">
                      {announcement.inApp && (
                        <Bell className="h-3 w-3"  />
                      )}
                      {announcement.email && (
                        <Mail className="h-3 w-3"  />
                      )}
                      {announcement.push && (
                        <Smartphone className="h-3 w-3"  />
                      )}
                    </div>
                    <span>
                      Target:{" "}
                      {TARGET_LABELS[announcement.targetUsers] ??
                        announcement.targetUsers}
                    </span>
                    <span>{announcement.recipientCount} recipients</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>
                        Sent {formatDateFromNow(announcement.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    By {announcement.createdBy.name ?? announcement.createdBy.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <UrlPagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
        />
      </div>
    </>
  );
}
