'use server';

import { ActivityEventMap, NotificationChannel } from "@/types/utils";
import { CreateNotification, NotificationStatus } from "@/types/models";
import {
    createUserActivity,
    findActivitiesTargetingUser,
    findActivity,
    findUserActivityById,
} from "@/db/activity";
import {
    deletePushSubscriptionByEndpoint,
    findPushSubscriptionsByUserId,
} from "@/db/push-subscription";

import { auth } from "@/auth";
import { createNotification } from "@/db/notification";
import { findNotificationPreference } from "@/db/notification-preference";
import { findUser } from "@/db/user";
import { sendNotificationEmail } from "@/lib/notification-email";
import { userNotificationEvents } from "../constants";
import webpush from "web-push";

if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    webpush.setVapidDetails(
        `mailto:${process.env.ADMIN_MAIL ?? "noreply@ipinayo.com"}`,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function createActivity<E extends keyof ActivityEventMap>({ targetUsers, event, entityId, metadata, channels }: {
    targetUsers: string[];
    event: E;
    entityId: string;
    metadata: ActivityEventMap[E]["metadata"];
    channels?: NotificationChannel[];
}) {
    try {

        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const actorId = session.user.id;
        const entityType = (event as string).split(".")[0];

        const activity = await createUserActivity({
            actorId,
            targetUsers,
            event,
            entityId,
            entityType,
            metadata,
        });

        await Promise.all(
            targetUsers.map(async (userId) => {
                const resolvedChannels = channels ?? await resolveChannel(userId, event);
                await sendNotification(activity.id, entityId, userId, resolvedChannels, event, metadata);
            })
        );

        return activity;
    } catch (error: any) {
        console.error("Error creating activity:", error);
    }
}

export async function getActivityById(activityId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const activity = await findActivity(activityId);
        if (!activity) {
            throw new Error("Activity not found");
        }

        return activity;
    } catch (error: any) {
        console.error("Error fetching activity:", error);
        throw new Error("Error fetching activity: " + error?.message);
    }
}

export async function getUserActivityById(activityId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const activity = await findUserActivityById(session.user.id, activityId);
        if (!activity) {
            throw new Error("Activity not found");
        }

        return activity;
    } catch (error: any) {
        console.error("Error fetching user activity:", error);
        throw new Error("Error fetching user activity: " + error?.message);
    }
}

export async function getMyActivities({
    page = 1,
    limit = 20,
}: { page?: number; limit?: number } = {}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const { activities, total } = await findActivitiesTargetingUser(session.user.id, { page, limit });

        return {
            activities,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error: any) {
        console.error("Error fetching all related activities:", error);
        throw new Error("Error fetching all related activities: " + error?.message);
    }
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

function getTitle<K extends keyof ActivityEventMap>(
    event: K,
    metadata: ActivityEventMap[K]["metadata"],
) {
    switch (event) {
        case "selection.created_by_self":
            return `New selection`;
        case "selection.cloned_by_self":
            return `Selection cloned`;
        case "selection.cloned_by_other":
            return `Your selection was cloned`;
        case "selection.updated_by_self":
            return `Selection updated`;
        case "selection.deleted_by_self":
            return `Selection deleted`;
        case "user.registered":
            return `Welcome to Ìpínayò`;
        case "draft.created_by_self":
            return `New draft created`;
        case "draft.updated_by_self":
            return `Draft updated`;
        case "draft.deleted_by_other":
            return `Your draft was deleted`;
        case "draft.deleted_by_self":
            return `Draft deleted`;
        case "draft.expired":
            return `Draft expired`;
        case "draft.expiring":
            return `Draft expiring soon`;
        case "system.announcement": {
            const data = metadata as ActivityEventMap["system.announcement"]["metadata"];
            return data.title;
        }
        default:
            return "You have a new notification";
    }
}

function getMessage<K extends keyof ActivityEventMap>(
    event: K,
    metadata: ActivityEventMap[K]["metadata"]
) {
    switch (event) {
        case "selection.created_by_self":
            {
                const data = metadata as ActivityEventMap["selection.created_by_self"]["metadata"];
                return `Your selection "${data.title}" has been created successfully.`;
            }
        case "selection.cloned_by_self":
            {
                const data = metadata as ActivityEventMap["selection.cloned_by_self"]["metadata"];
                return `Your selection "${data.title}" has been cloned successfully.`;
            }
        case "selection.cloned_by_other":
            {
                const data = metadata as ActivityEventMap["selection.cloned_by_other"]["metadata"];
                return `Your selection "${data.title}" was cloned by user - ${data.actorName}.`;
            }
        case "selection.updated_by_self":
            {
                const data = metadata as ActivityEventMap["selection.updated_by_self"]["metadata"];
                return `Your selection "${data.title}" has been updated successfully.`;
            }
        case "selection.deleted_by_self":
            {
                const data = metadata as ActivityEventMap["selection.deleted_by_self"]["metadata"];
                return `Your selection "${data.title}" has been deleted successfully.`;
            }
        case "user.registered":
            {
                const data = metadata as ActivityEventMap["user.registered"]["metadata"];
                return `Hi ${data.name}, thanks for joining Ìpínayò! We're excited to have you on board. Start exploring and creating your selections!`;
            }
        case "draft.created_by_self":
            return `Your draft has been created successfully.`;
        case "draft.updated_by_self":
            {
                const data = metadata as ActivityEventMap["draft.updated_by_self"]["metadata"];
                return `Your draft "${data.title}" has been updated successfully.`;
            }
        case "draft.deleted_by_self":
            {
                const data = metadata as ActivityEventMap["draft.deleted_by_self"]["metadata"];
                return `Your draft "${data.title}" has been deleted successfully.`;
            }
        case "draft.deleted_by_other":
            {
                const data = metadata as ActivityEventMap["draft.deleted_by_other"]["metadata"];
                return data.expired ? `Your expired draft "${data.title}" was deleted` : `Your draft "${data.title}" was deleted by ${data.actorName}.`;
            }
        case "draft.expired":
            {
                const data = metadata as ActivityEventMap["draft.expired"]["metadata"];
                return `Your draft "${data.title}" has expired and will be deleted.`;
            }
        case "draft.expiring":
            {
                const data = metadata as ActivityEventMap["draft.expiring"]["metadata"];
                return `Your draft "${data.title}" is expiring soon. Please take necessary action to avoid deletion.`;
            }
        case "system.announcement": {
            const data = metadata as ActivityEventMap["system.announcement"]["metadata"];
            return data.message;
        }
        default:
            return "You have a new notification";
    }
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
            return `/dashboard`;

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
            return `/selections/${entityId}`;

        case "selection.cloned_by_other":
            return `/selections/${entityId}`;

        case "selection.deleted_by_self":
            return `/dashboard`;

        case "draft.created_by_self":
        case "draft.updated_by_self":
            return `/drafts/${entityId}`;

        case "draft.deleted_by_self":
            return `/dashboard`;

        case "user.updated":
            return `/profile`;

        case "user.registered":
            return `/dashboard`;

        case "system.announcement":
            return `/`;

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
                    await deletePushSubscriptionByEndpoint(sub.endpoint);
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