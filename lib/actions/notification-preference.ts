'use server';

import {
    deleteUserNotificationPreferences,
    findUserNotificationPreferences,
    upsertNotificationPreference,
} from "@/db/notification-preference";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { userNotificationEvents } from "@/lib/constants";

export type NotificationPreferenceItem = {
    event: string;
    label: string;
    description: string;
    inApp: boolean;
    email: boolean;
    push: boolean;
};

type EventKey = keyof typeof userNotificationEvents;

/**
 * Returns the user's notification preferences for every configurable event,
 * merging any saved overrides over the per-event defaults.
 */
export async function getMyNotificationPreferencesAction(): Promise<NotificationPreferenceItem[]> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const saved = await findUserNotificationPreferences(session.user.id);
    const savedByEvent = new Map(saved.map((p) => [p.event, p]));

    return (Object.keys(userNotificationEvents) as EventKey[]).map((event) => {
        const config = userNotificationEvents[event]!;
        const override = savedByEvent.get(event);

        return {
            event,
            label: config.label,
            description: config.description,
            inApp: override?.inApp ?? config.default.inApp,
            email: override?.email ?? config.default.email,
            push: override?.push ?? config.default.push,
        };
    });
}

export type NotificationPreferenceInput = {
    event: string;
    inApp: boolean;
    email: boolean;
    push: boolean;
};

/**
 * Upserts the user's notification preferences. Unknown events are ignored so a
 * stale client can't write preferences for events that no longer exist.
 */
export async function updateNotificationPreferencesAction(
    preferences: NotificationPreferenceInput[]
) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;
    const validEvents = new Set(Object.keys(userNotificationEvents));
    // System announcements are mandatory — never persist preferences for them.
    const toSave = preferences.filter(
        (p) => validEvents.has(p.event) && !p.event.startsWith("system.")
    );

    await Promise.all(
        toSave.map((p) =>
            upsertNotificationPreference(userId, p.event, {
                user: { connect: { id: userId } },
                event: p.event,
                inApp: p.inApp,
                email: p.email,
                push: p.push,
            })
        )
    );

    revalidatePath("/settings/notifications");

    return { message: "Notification preferences updated" };
}

/**
 * Clears all of the user's saved preferences so every event falls back to its
 * default channels.
 */
export async function restoreNotificationDefaultsAction() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await deleteUserNotificationPreferences(session.user.id);

    revalidatePath("/settings/notifications");

    return { message: "Notification preferences restored to defaults" };
}
