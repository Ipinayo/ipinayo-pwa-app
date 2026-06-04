"use client";

import { ChevronDown, Clock } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  cn,
  formatDate,
  formatDateFromNow,
  getActivityEntity,
  getActivityEvent,
} from "@/lib/utils";

import ActivityIcon from "@/components/common/activity-icon";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { JsonValue } from "@prisma/client/runtime/library";
import { useState } from "react";

type ActivityUser = { id: string; name: string | null; email: string };

type ActivityRecipientItem = {
  user: ActivityUser;
  entityId: string | null;
  metadata: JsonValue;
};

export type AdminActivityItem = {
  id: string;
  event: string;
  entityType: string;
  entityId: string;
  metadata: JsonValue;
  createdAt: Date;
  actor: ActivityUser | null;
  recipients: ActivityRecipientItem[];
};

const displayName = (user: ActivityUser | null) =>
  user?.name || user?.email || "System";

const recipientTitle = (recipient: ActivityRecipientItem) =>
  (recipient.metadata as { title?: string } | null)?.title;

export default function AdminActivityRow({
  activity,
}: {
  activity: AdminActivityItem;
}) {
  const [open, setOpen] = useState(false);

  const performer = activity.actor;
  // Affected users are the recipients, excluding the actor so a self-action
  // isn't listed twice.
  const affected = activity.recipients.filter(
    (recipient) => recipient.user.id !== activity.actor?.id,
  );
  const entity = getActivityEntity(activity.event, activity.metadata);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="overflow-hidden py-0">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-muted/50"
          >
            <div className="flex-none rounded-full bg-muted p-2">
              <ActivityIcon event={activity.event} className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {entity || getActivityEvent(activity.event, true)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getActivityEvent(activity.event, true)}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 capitalize">
                  {activity.entityType}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  by{" "}
                  <span className="font-medium text-foreground">
                    {displayName(performer)}
                  </span>
                </span>
                {affected.length > 0 && (
                  <span>
                    · affects {affected.length}{" "}
                    {affected.length === 1 ? "user" : "users"}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDateFromNow(activity.createdAt)}
                </span>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "mt-1 h-4 w-4 flex-none text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-3 border-t px-4 py-3 text-sm">
            <DetailRow
              label="Performed by"
              value={
                performer?.email
                  ? `${displayName(performer)} · ${performer.email}`
                  : displayName(performer)
              }
            />

            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <span className="text-xs font-medium text-muted-foreground sm:w-28 sm:flex-none">
                Affected users
              </span>
              {affected.length === 0 ? (
                <span className="text-muted-foreground">
                  Just {displayName(performer)} (self)
                </span>
              ) : (
                <ul className="space-y-0.5">
                  {affected.map((recipient) => (
                    <li key={recipient.user.id} className="wrap-break-word">
                      {displayName(recipient.user)}
                      {recipient.user.email ? (
                        <span className="text-muted-foreground">
                          {" "}
                          · {recipient.user.email}
                        </span>
                      ) : null}
                      {recipientTitle(recipient) ? (
                        <span className="text-muted-foreground">
                          {" "}
                          — {recipientTitle(recipient)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <DetailRow label="Entity ID" value={activity.entityId} />
            <DetailRow label="Event" value={activity.event} />
            <DetailRow label="When" value={formatDate(activity.createdAt)} />
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <span className="text-xs font-medium text-muted-foreground sm:w-28 sm:flex-none">
        {label}
      </span>
      <span className="wrap-break-word">{value}</span>
    </div>
  );
}
