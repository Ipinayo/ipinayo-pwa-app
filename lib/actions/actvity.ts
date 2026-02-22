'use server';

import {
    createUserActivity,
    findActivitiesTargetingUser,
    findActivity,
    findAllUserRelatedActivities,
    findUserActivities,
    findUserActivityById,
} from "@/db/activity";

import { ActivityEventMap } from "@/types/utils";
import { auth } from "@/auth";

export async function createActivity<E extends keyof ActivityEventMap>(input: {
    targetUsers: string[];
    event: E;
    entityId: string;
    metadata: ActivityEventMap[E]["metadata"];
}) {
    try {

        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const actorId = session.user.id;
        const { targetUsers, event, entityId, metadata } = input;
        const entityType = (event as string).split(".")[0];

        return await createUserActivity({
            actor: { connect: { id: actorId } },
            targetUsers: targetUsers.length > 0
                ? { connect: targetUsers.map((id) => ({ id })) }
                : undefined,
            event,
            entityId,
            entityType,
            metadata: metadata as any,
        });
    } catch (error: any) {
        console.error("Error creating activity:", error);
        throw new Error("Error creating activity: " + error?.message);
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

        const { activities, total } = await findUserActivities(session.user.id, { page, limit });

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
        console.error("Error fetching user activities:", error);
        throw new Error("Error fetching user activities: " + error?.message);
    }
}

export async function getActivitiesTargetingMe({
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
        console.error("Error fetching activities targeting user:", error);
        throw new Error("Error fetching activities targeting user: " + error?.message);
    }
}

export async function getAllMyRelatedActivities({
    page = 1,
    limit = 20,
}: { page?: number; limit?: number } = {}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const { activities, total } = await findAllUserRelatedActivities(session.user.id, { page, limit });

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