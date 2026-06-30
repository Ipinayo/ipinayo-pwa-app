import "server-only";

import { ActivityEventMap, NotificationChannel } from "@/types/utils";
import { CreateNotification, NotificationStatus } from "@/types/models";
import {
    deletePushSubscriptionByEndpoint,
    findPushSubscriptionsByUserId,
} from "@/db/push-subscription";

import { after } from "next/server";
import { createNotification } from "@/db/notification";
import { createUserActivity } from "@/db/activity";
import { findNotificationPreference } from "@/db/notification-preference";
import { findUser } from "@/db/user";
import { sendNotificationEmail } from "@/lib/notification-email";
import { userNotificationEvents } from "@/lib/constants";
import webpush from "web-push";

if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    webpush.setVapidDetails(
        `mailto:${process.env.ADMIN_MAIL ?? "noreply@ipinayo.com"}`,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

type EventMeta<K extends keyof ActivityEventMap> = ActivityEventMap[K]["metadata"];

/** A per-event value: either a static string or a builder from the metadata.
 *  Typed as a full mapped type so adding an event forces an entry here. */
type EventText = {
    [K in keyof ActivityEventMap]: string | ((m: EventMeta<K>) => string);
};

/**
 * Creates an activity and fans out notifications across the resolved channels.
 *
 * This is an internal server helper, NOT a server action — it must never be a
 * directly callable endpoint, since it can write notifications for arbitrary
 * users. Callers (already-authorized actions, or the cron route) pass the actor
 * explicitly; system/background events pass a resolved system actor.
 *
 * The fan-out runs inside `after()` so it completes after the response is sent
 * without blocking the caller, and isn't dropped when the serverless function
 * would otherwise be frozen. `after()` is registered synchronously (no await
 * before it) so callers don't need to await this function.
 */
export async function createActivity<E extends keyof ActivityEventMap>({
    targetUsers,
    event,
    entityId,
    metadata,
    channels,
    actorId,
}: {
    targetUsers: string[];
    event: E;
    entityId: string;
    metadata: ActivityEventMap[E]["metadata"];
    channels?: NotificationChannel[];
    actorId: string;
}) {
    const entityType = (event as string).split(".")[0];

    after(async () => {
        try {
            // All recipients share the same metadata/entityId for a non-batch
            // event, so it lives on the Activity; recipients carry no override.
            const activity = await createUserActivity({
                actorId,
                event,
                entityId,
                entityType,
                metadata,
                recipients: targetUsers.map((userId) => ({ userId })),
            });

            await Promise.all(
                targetUsers.map(async (userId) => {
                    const resolvedChannels =
                        channels ?? (await resolveChannel(userId, event));
                    await sendNotification(
                        activity.id,
                        entityId,
                        userId,
                        resolvedChannels,
                        event,
                        metadata
                    );
                })
            );
        } catch (error: any) {
            console.error("Error dispatching activity:", error);
        }
    });
}

/**
 * Bulk variant of createActivity for fan-outs where each recipient has DIFFERENT
 * details (e.g. the draft-maintenance cron, where every user's draft differs).
 *
 * Writes a SINGLE Activity (carrying the shared `summaryMetadata`) plus one
 * ActivityRecipient per user holding that user's own `entityId`/`metadata`, then
 * a personalized notification per recipient. The personal activity feed reads
 * the recipient row, so each user sees only their own details from one Activity.
 */
export async function createBatchActivity<E extends keyof ActivityEventMap>({
    event,
    actorId,
    channels,
    summaryMetadata,
    summaryEntityId,
    recipients,
}: {
    event: E;
    actorId: string;
    channels?: NotificationChannel[];
    summaryMetadata: ActivityEventMap[E]["metadata"];
    summaryEntityId?: string;
    recipients: {
        userId: string;
        entityId: string;
        metadata: ActivityEventMap[E]["metadata"];
    }[];
}) {
    if (recipients.length === 0) return;

    const entityType = (event as string).split(".")[0];

    after(async () => {
        try {
            const activity = await createUserActivity({
                actorId,
                event,
                entityType,
                entityId: summaryEntityId ?? "",
                metadata: summaryMetadata,
                recipients: recipients.map((recipient) => ({
                    userId: recipient.userId,
                    entityId: recipient.entityId,
                    metadata: recipient.metadata,
                })),
            });

            await Promise.all(
                recipients.map(async (recipient) => {
                    const resolvedChannels =
                        channels ?? (await resolveChannel(recipient.userId, event));
                    await sendNotification(
                        activity.id,
                        recipient.entityId,
                        recipient.userId,
                        resolvedChannels,
                        event,
                        recipient.metadata
                    );
                })
            );
        } catch (error: any) {
            console.error("Error dispatching batch activity:", error);
        }
    });
}

const resolveChannel = async <E extends keyof ActivityEventMap>(userId: string, event: E) => {
    const defaultChannels = userNotificationEvents[event]?.default
    const userOverride = await findNotificationPreference(userId, event)

    const channels = [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH].filter(channel => {
        const defaultEnabled = defaultChannels?.[channel] ?? false
        const userSetting = userOverride ? userOverride[channel] : undefined

        if (userSetting === undefined) {
            return defaultEnabled
        }

        return userSetting
    })

    return channels
}

/** "an editor" / "a viewer" — a humanized collaborator role with its article. */
function roleArticle(role: string) {
    const label = role.toLowerCase();
    const article = /^[aeiou]/.test(label) ? "an" : "a";
    return `${article} ${label}`;
}

const TITLES: EventText = {
    "selection.created_by_self": "New selection",
    "selection.cloned_by_self": "Selection cloned",
    "selection.cloned_by_other": "Your selection was cloned",
    "selection.updated_by_self": "Selection updated",
    "selection.deleted_by_self": "Selection deleted",
    "selection.deleted_by_other": "A shared selection was deleted",
    "selection.shared_with_other": "A selection was shared with you",
    "selection.shared_by_other": "Your selection was shared",
    "selection.shared_by_self": "Selection shared",
    "selection.role_updated": "Your access changed",
    "selection.updated_by_other": "A shared selection was updated",
    "selection.access_revoked": "Your access was removed",
    "draft.access_revoked": "Your access was removed",
    "draft.shared_with_other": "A draft was shared with you",
    "draft.shared_by_other": "Your draft was shared",
    "draft.shared_by_self": "Draft shared",
    "draft.role_updated": "Your access changed",
    "draft.updated_by_other": "A shared draft was updated",
    "draft.created_by_self": "New draft created",
    "draft.updated_by_self": "Draft updated",
    "draft.deleted_by_self": "Draft deleted",
    "draft.deleted_by_other": "Your draft was deleted",
    "draft.expired": "Draft expired",
    "draft.expiring": "Draft expiring soon",
    "collaboration.added_to_group": "You were added to a group",
    "collaboration.removed_from_group": "You were removed from a group",
    "collaboration.left_group": "A member left your group",
    "collaboration.left_group_by_self": (m) => `You left ${m.groupName}`,
    "collaboration.group_created_by_self": (m) => `You created ${m.groupName}`,
    "collaboration.group_deleted_by_self": (m) => `You deleted ${m.groupName}`,
    "collaboration.group_role_updated": "Your group role changed",
    "user.registered": "Welcome to Ìpínayò",
    "user.updated": "Profile updated",
    "system.announcement": (m) => m.title,
    "system.maintenance": (m) => m.title,
};

function getTitle<K extends keyof ActivityEventMap>(
    event: K,
    metadata: EventMeta<K>,
): string {
    const t = TITLES[event] as string | ((m: EventMeta<K>) => string);
    return typeof t === "function" ? t(metadata) : t;
}

const MESSAGES: EventText = {
    "selection.created_by_self": (m) => `Your selection "${m.title}" has been created successfully.`,
    "selection.cloned_by_self": (m) => `Your selection "${m.title}" has been cloned successfully.`,
    "selection.cloned_by_other": (m) => `Your selection "${m.title}" was cloned by user - ${m.actorName}.`,
    "selection.updated_by_self": (m) => `Your selection "${m.title}" has been updated successfully.`,
    "selection.deleted_by_self": (m) => `Your selection "${m.title}" has been deleted successfully.`,
    "selection.deleted_by_other": (m) => `${m.actorName} deleted the selection "${m.title}".`,
    "selection.shared_with_other": (m) => `${m.actorName} invited you to the selection - "${m.title}" as ${roleArticle(m.role)}.`,
    "selection.shared_by_other": (m) => `${m.actorName} shared your selection "${m.title}" with ${m.count} ${m.count === 1 ? "person" : "people"}.`,
    "selection.shared_by_self": (m) => `You shared "${m.title}" with ${m.count} ${m.count === 1 ? "person" : "people"}.`,
    "selection.role_updated": (m) => `${m.actorName} changed your access to "${m.title}" to ${roleArticle(m.role)}.`,
    "selection.updated_by_other": (m) => `${m.actorName} updated the selection "${m.title}".`,
    "selection.access_revoked": (m) => `${m.actorName} revoked your access to the selection "${m.title}".`,
    "draft.access_revoked": (m) => `${m.actorName} revoked your access to the draft "${m.title}".`,
    "draft.shared_with_other": (m) => `${m.actorName} invited you to the draft - "${m.title}" as ${roleArticle(m.role)}.`,
    "draft.shared_by_other": (m) => `${m.actorName} shared your selection draft "${m.title}" with ${m.count} ${m.count === 1 ? "person" : "people"}.`,
    "draft.shared_by_self": (m) => `You shared the draft "${m.title}" with ${m.count} ${m.count === 1 ? "person" : "people"}.`,
    "draft.role_updated": (m) => `${m.actorName} changed your access to the draft "${m.title}" to ${roleArticle(m.role)}.`,
    "draft.updated_by_other": (m) => `${m.actorName} updated the draft "${m.title}".`,
    "draft.created_by_self": "Your draft has been created successfully.",
    "draft.updated_by_self": (m) => `Your draft "${m.title}" has been updated successfully.`,
    "draft.deleted_by_self": (m) => `Your draft "${m.title}" has been deleted successfully.`,
    "draft.deleted_by_other": (m) =>
        m.expired ? `Your expired draft "${m.title}" was deleted` : `Your draft "${m.title}" was deleted by ${m.actorName}.`,
    "draft.expired": (m) => `Your draft "${m.title}" has expired and will be deleted.`,
    "draft.expiring": (m) => `Your draft "${m.title}" is expiring soon. Please take necessary action to avoid deletion.`,
    "collaboration.added_to_group": (m) => `${m.actorName} added you to the group "${m.groupName}" as ${roleArticle(m.role)}, giving you access to its selections and drafts.`,
    "collaboration.removed_from_group": (m) => `${m.actorName} removed you from the group "${m.groupName}".`,
    "collaboration.left_group": (m) => `${m.actorName} left the group "${m.groupName}".`,
    "collaboration.left_group_by_self": (m) => `You left the group "${m.groupName}".`,
    "collaboration.group_created_by_self": (m) => `You created the group "${m.groupName}".`,
    "collaboration.group_deleted_by_self": (m) => `You deleted the group "${m.groupName}".`,
    "collaboration.group_role_updated": (m) => `${m.actorName} changed your role in "${m.groupName}" to ${roleArticle(m.role)}.`,
    "user.registered": (m) => `Hi ${m.name}, thanks for joining Ìpínayò! We're excited to have you on board. Start exploring and creating your selections!`,
    "user.updated": "Your profile has been updated.",
    "system.announcement": (m) => m.message,
    "system.maintenance": (m) => m.message,
};

function getMessage<K extends keyof ActivityEventMap>(
    event: K,
    metadata: EventMeta<K>,
): string {
    const m = MESSAGES[event] as string | ((meta: EventMeta<K>) => string);
    return typeof m === "function" ? m(metadata) : m;
}

function getActionURL<K extends keyof ActivityEventMap>(
    event: K,
    entityId: string,
) {
    switch (event) {

        case "draft.expiring":
            return `/liturgical-selections/new`;

        case "draft.expired":
        case "draft.deleted_by_other":
        case "selection.deleted_by_other":
        case "selection.access_revoked":
        case "draft.access_revoked":
            return `/dashboard`;

        case "selection.shared_with_other":
        case "selection.shared_by_other":
        case "selection.role_updated":
        case "selection.updated_by_other":
            return `/liturgical-selections/${entityId}`;

        case "draft.shared_with_other":
        case "draft.shared_by_other":
        case "draft.role_updated":
        case "draft.updated_by_other":
            return `/liturgical-selections/new/${entityId}`;

        case "collaboration.added_to_group":
        case "collaboration.removed_from_group":
        case "collaboration.left_group":
        case "collaboration.left_group_by_self":
        case "collaboration.group_created_by_self":
        case "collaboration.group_deleted_by_self":
        case "collaboration.group_role_updated":
            return '/settings/groups';

        default:
            return undefined;
    }
}

function getPath<K extends keyof ActivityEventMap>(
    event: K,
    entityId: string,
) {
    switch (event) {

        case "draft.expiring":
            return `/liturgical-selections/new`;

        case "draft.expired":
        case "draft.deleted_by_other":
            return `/dashboard`;

        case "selection.created_by_self":
        case "selection.cloned_by_self":
        case "selection.updated_by_self":
            return `/liturgical-selections/${entityId}`;

        case "selection.cloned_by_other":
            return `/liturgical-selections/${entityId}`;

        case "selection.shared_with_other":
        case "selection.shared_by_other":
        case "selection.shared_by_self":
        case "selection.role_updated":
        case "selection.updated_by_other":
            return `/liturgical-selections/${entityId}`;

        case "selection.deleted_by_self":
        case "selection.deleted_by_other":
        case "selection.access_revoked":
        case "draft.access_revoked":
            return `/dashboard`;

        case "draft.created_by_self":
        case "draft.updated_by_self":
        case "draft.shared_with_other":
        case "draft.shared_by_other":
        case "draft.shared_by_self":
        case "draft.role_updated":
        case "draft.updated_by_other":
            return `/liturgical-selections/new/${entityId}`;

        case "draft.deleted_by_self":
            return `/dashboard`;

        case "user.updated":
            return `/profile`;

        case "user.registered":
            return `/settings/profile`;

        case "system.announcement":
            return `/`;

        case "collaboration.added_to_group":
        case "collaboration.removed_from_group":
        case "collaboration.left_group":
        case "collaboration.left_group_by_self":
        case "collaboration.group_created_by_self":
        case "collaboration.group_deleted_by_self":
        case "collaboration.group_role_updated":
            return `/settings/groups`;

        default:
            return undefined;
    }
}

/**
 * Absolute, always-defined variant of getActionURL. Push runs in the service
 * worker and email links are opened from an external client — both need a full
 * URL rather than an app-relative path. Falls back to the app root.
 */
function getAbsoluteActionURL<K extends keyof ActivityEventMap>(
    event: K,
    entityId: string,
) {
    const path = getPath(event, entityId) ?? "/";
    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

    return new URL(path, baseUrl).toString();
}

async function sendPushNotifications(
    userId: string,
    title: string,
    message: string,
    pushUrl: string,
) {
    const subscriptions = await findPushSubscriptionsByUserId(userId);
    if (subscriptions.length === 0) return;

    const payload = JSON.stringify({
        title,
        body: message,
        url: pushUrl,
    });

    await Promise.all(
        subscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: { p256dh: sub.p256dh, auth: sub.auth },
                    },
                    payload
                );
            } catch (error: any) {
                // 410 Gone or 404 Not Found means the subscription is no longer valid
                if (error?.statusCode === 410 || error?.statusCode === 404) {
                    await deletePushSubscriptionByEndpoint(sub.endpoint, userId);
                } else {
                    console.error(`Push delivery failed for ${sub.endpoint}:`, error);
                }
            }
        })
    );
}

async function sendNotification(
    activityId: string,
    entityId: string,
    userId: string,
    channels: NotificationChannel[],
    event: keyof ActivityEventMap,
    metadata: ActivityEventMap[typeof event]["metadata"]
) {
    const title = getTitle(event, metadata)
    const message = getMessage(event, metadata)
    const actionUrl = getActionURL(event, entityId)
    const absoluteUrl = getAbsoluteActionURL(event, entityId)

    // Each channel is isolated so one channel's failure (e.g. a dead SMTP
    // server) can't suppress the others, and one recipient can't abort the rest.
    const deliveries: Promise<unknown>[] = []

    if (channels.includes(NotificationChannel.EMAIL)) {
        deliveries.push(
            (async () => {
                const user = await findUser(userId)
                if (user?.email) {
                    await sendNotificationEmail(user.email, event, metadata, absoluteUrl)
                }
            })()
        )
    }

    if (channels.includes(NotificationChannel.PUSH)) {
        deliveries.push(sendPushNotifications(userId, title, message, absoluteUrl))
    }

    if (channels.includes(NotificationChannel.IN_APP)) {
        const notification: CreateNotification = {
            activityId,
            userId,
            status: NotificationStatus.UNREAD,
            title,
            message,
            actionUrl,
        }
        deliveries.push(createNotification(notification))
    }

    const results = await Promise.allSettled(deliveries)
    for (const result of results) {
        if (result.status === "rejected") {
            console.error("Error sending notification:", result.reason)
        }
    }
}
