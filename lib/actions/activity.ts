'use server';

import {
    findActivity,
    findUserActivityById,
    findUserActivityFeed,
} from "@/db/activity";

import { auth } from "@/auth";

// Events the user is notified about but shouldn't see in their activity feed.
const HIDDEN_FEED_EVENTS = ["draft.expiring"];

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

        const { recipients, total } = await findUserActivityFeed(session.user.id, {
            page,
            limit,
            excludeEvents: HIDDEN_FEED_EVENTS,
        });

        return {
            activities: recipients,
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
