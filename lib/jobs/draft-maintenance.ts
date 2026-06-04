import "server-only";

import { deleteAllOldDrafts, findDraftsExpiringSoon } from "@/db/admin";

import { createBatchActivity } from "@/lib/notifications/dispatch";

const SYSTEM_ACTOR_NAME = "Ìpínayò System";

/**
 * Notifies draft owners whose drafts are expiring soon. Creates a single
 * Activity with one recipient per owner (each carrying their own draft).
 * Returns the count.
 */
export async function notifyExpiringDrafts(actorId: string) {
    const expiringDrafts = await findDraftsExpiringSoon();

    await createBatchActivity({
        event: "draft.expiring",
        actorId,
        summaryMetadata: {
            title: `${expiringDrafts.length} draft(s) expiring soon`,
        },
        recipients: expiringDrafts.map((draft) => ({
            userId: draft.createdById,
            entityId: draft.id,
            metadata: { title: draft.title || "Untitled Draft" },
        })),
    });

    return expiringDrafts.length;
}

/**
 * Deletes expired drafts and notifies their owners via a single Activity with
 * one recipient per owner. Returns the count.
 */
export async function purgeOldDrafts(actorId: string) {
    const deletedDrafts = await deleteAllOldDrafts();

    await createBatchActivity({
        event: "draft.deleted_by_other",
        actorId,
        summaryMetadata: {
            title: `${deletedDrafts.length} expired draft(s) deleted`,
            actorName: SYSTEM_ACTOR_NAME,
            expired: true,
        },
        recipients: deletedDrafts.map((draft) => ({
            userId: draft.createdById,
            entityId: draft.id,
            metadata: {
                title: draft.title || "Untitled Draft",
                actorName: SYSTEM_ACTOR_NAME,
                expired: true,
            },
        })),
    });

    return deletedDrafts.length;
}
