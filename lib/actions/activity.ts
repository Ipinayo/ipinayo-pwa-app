'use server';

import {
    findActivitiesTargetingUser,
    findActivity,
    findUserActivityById,
} from "@/db/activity";

import { auth } from "@/auth";

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
