import prisma from "@/lib/prisma";

export async function createPushSubscription(data: {
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent?: string;
}) {
    return await prisma.pushSubscription.upsert({
        where: { endpoint: data.endpoint },
        update: {
            userId: data.userId,
            p256dh: data.p256dh,
            auth: data.auth,
            userAgent: data.userAgent,
            lastUsedAt: new Date(),
        },
        create: {
            userId: data.userId,
            endpoint: data.endpoint,
            p256dh: data.p256dh,
            auth: data.auth,
            userAgent: data.userAgent,
        },
    });
}

export async function deletePushSubscriptionByEndpoint(endpoint: string, userId: string) {
    return await prisma.pushSubscription.deleteMany({
        where: { endpoint, userId },
    });
}

export async function findPushSubscriptionsByUserId(userId: string) {
    return await prisma.pushSubscription.findMany({
        where: { userId },
    });
}
