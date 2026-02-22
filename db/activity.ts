import { CreateActivity } from "@/types/models";
import { Prisma } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";

export async function createUserActivity(data: CreateActivity) {
    return await prisma.activity.create({
        data: {
            ...data,
            targetUsers: {
                connect: data.targetUsers.map((userId) => ({ id: userId })),
            },
        },
    });
}

export async function findUserActivityById(userId: string, activityId: string) {
    return await prisma.activity.findFirst({
        where: { actorId: userId, id: activityId },
    });
}

export async function findActivity(activityId: string) {
    return await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
            actor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            targetUsers: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
}

export async function findAllActivities({
    page = 1,
    limit = 20,
    actorId,
    entityType,
    event,
}: {
    page?: number;
    limit?: number;
    actorId?: string;
    entityType?: string;
    event?: string;
} = {}) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ActivityWhereInput = {};
    const andConditions: Prisma.ActivityWhereInput[] = [];

    if (actorId) andConditions.push({ actorId });
    if (entityType) andConditions.push({ entityType });
    if (event) andConditions.push({ event });

    if (andConditions.length > 0) {
        whereClause.AND = andConditions;
    }

    const [activities, total] = await Promise.all([
        prisma.activity.findMany({
            where: whereClause,
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                targetUsers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.activity.count({ where: whereClause }),
    ]);

    return { activities, total };
}

export async function findUserActivities(
    userId: string,
    { page = 1, limit = 20 }: { page?: number; limit?: number } = {}
) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ActivityWhereInput = {
        actorId: userId,
    };

    const [activities, total] = await Promise.all([
        prisma.activity.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.activity.count({ where: whereClause }),
    ]);

    return { activities, total };
}

export async function findActivitiesTargetingUser(
    userId: string,
    { page = 1, limit = 20 }: { page?: number; limit?: number } = {}
) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ActivityWhereInput = {
        targetUsers: {
            some: { id: userId },
        },
    };

    const [activities, total] = await Promise.all([
        prisma.activity.findMany({
            where: whereClause,
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                targetUsers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.activity.count({ where: whereClause }),
    ]);

    return { activities, total };
}

export async function findAllUserRelatedActivities(
    userId: string,
    { page = 1, limit = 20 }: { page?: number; limit?: number } = {}
) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ActivityWhereInput = {
        OR: [
            { actorId: userId },
            { targetUsers: { some: { id: userId } } },
        ],
    };

    const [activities, total] = await Promise.all([
        prisma.activity.findMany({
            where: whereClause,
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                targetUsers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.activity.count({ where: whereClause }),
    ]);

    return { activities, total };
}