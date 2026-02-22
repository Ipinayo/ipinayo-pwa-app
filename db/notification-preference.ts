import { Prisma } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";

export async function createNotificationPreference(
    data: Prisma.NotificationPreferenceCreateInput
) {
    return await prisma.notificationPreference.create({
        data,
    });
}

export async function findNotificationPreferenceById(id: string) {
    return await prisma.notificationPreference.findUnique({
        where: { id },
    });
}

export async function findUserNotificationPreferences(userId: string) {
    return await prisma.notificationPreference.findMany({
        where: { userId },
    });
}

export async function findNotificationPreference(userId: string, event: string) {
    return await prisma.notificationPreference.findUnique({
        where: { userId_event: { userId, event } },
    });
}

export async function updateNotificationPreference(
    id: string,
    data: Prisma.NotificationPreferenceUpdateInput
) {
    return await prisma.notificationPreference.update({
        where: { id },
        data,
    });
}

export async function updateNotificationPreferenceByUserAndEvent(
    userId: string,
    event: string,
    data: Prisma.NotificationPreferenceUpdateInput
) {
    return await prisma.notificationPreference.update({
        where: { userId_event: { userId, event } },
        data,
    });
}

export async function deleteNotificationPreference(id: string) {
    return await prisma.notificationPreference.delete({
        where: { id },
    });
}

export async function deleteNotificationPreferenceByUserAndEvent(
    userId: string,
    event: string
) {
    return await prisma.notificationPreference.delete({
        where: { userId_event: { userId, event } },
    });
}

export async function upsertNotificationPreference(
    userId: string,
    event: string,
    data: Prisma.NotificationPreferenceCreateInput
) {
    return await prisma.notificationPreference.upsert({
        where: { userId_event: { userId, event } },
        update: data,
        create: data,
    });
}