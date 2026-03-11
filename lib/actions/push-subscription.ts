'use server';

import {
    createPushSubscription,
    deletePushSubscriptionByEndpoint,
    findPushSubscriptionsByUserId,
} from "@/db/push-subscription";

import { auth } from "@/auth";

export async function savePushSubscriptionAction(subscription: {
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await createPushSubscription({
            userId: session.user.id,
            ...subscription,
        });
    } catch (error: any) {
        console.error("Error saving push subscription:", error);
        throw new Error("Error saving push subscription: " + error?.message);
    }
}

export async function deletePushSubscriptionAction(endpoint: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await deletePushSubscriptionByEndpoint(endpoint);
    } catch (error: any) {
        console.error("Error deleting push subscription:", error);
        throw new Error("Error deleting push subscription: " + error?.message);
    }
}

export async function getMyPushSubscriptionsAction() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        return await findPushSubscriptionsByUserId(session.user.id);
    } catch (error: any) {
        console.error("Error fetching push subscriptions:", error);
        throw new Error("Error fetching push subscriptions: " + error?.message);
    }
}
