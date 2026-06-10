import "server-only";

import { NotificationChannel } from "@/types/utils";
import { createActivity } from "@/lib/notifications/dispatch";
import { deleteOldChatSessions } from "@/db/chat";

/**
 * Purge assistant conversations untouched for 20+ days. Silent for users — the
 * only record is a single in-app activity attributed to (and visible only to)
 * the super admin who runs maintenance. The DB layer just deletes; this job
 * owns the orchestration + audit.
 */
export async function purgeOldChats(actorId: string) {
  const deletedChats = await deleteOldChatSessions();

  if (deletedChats > 0) {
    createActivity({
      targetUsers: [actorId],
      actorId,
      event: "system.maintenance",
      entityId: "",
      channels: [NotificationChannel.IN_APP],
      metadata: {
        title: "Old conversations purged",
        message: `${deletedChats} assistant conversation(s) inactive for 20+ days were deleted.`,
      },
    });
  }

  return deletedChats;
}
