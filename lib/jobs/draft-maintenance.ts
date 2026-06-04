import "server-only";

import { deleteAllOldDrafts, findDraftsExpiringSoon } from "@/db/admin";

import { createActivity } from "@/lib/notifications/dispatch";

/**
 * The actor an activity is attributed to. For admin-triggered runs this is the
 * admin; for the cron it's a system actor (a real admin id for the Activity FK,
 * with a "system" display name on the user-facing notification).
 */

/** Notifies draft owners whose drafts are expiring soon. Returns the count. */
export async function notifyExpiringDrafts(actorId: string) {
    const expiringDrafts = await findDraftsExpiringSoon();

    expiringDrafts.forEach((expiringDraft) => {
        createActivity({
            targetUsers: [expiringDraft.createdById],
            event: "draft.expiring",
            entityId: expiringDraft.id,
            metadata: { title: expiringDraft.title || "Untitled Draft" },
            actorId: actorId,
        });
    });

    return expiringDrafts.length;
}

/** Deletes expired drafts and notifies their owners. Returns the count. */
export async function purgeOldDrafts(actorId: string) {
    const deletedDrafts = await deleteAllOldDrafts();

    deletedDrafts.forEach((deletedDraft) => {
        createActivity({
            targetUsers: [deletedDraft.createdById],
            event: "draft.deleted_by_other",
            entityId: deletedDraft.id,
            metadata: {
                title: deletedDraft.title || "Untitled Draft",
                actorName: "Ìpínayò System",
                expired: true,
            },
            actorId: actorId,
        });
    });

    return deletedDrafts.length;
}
