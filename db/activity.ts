import { CreateActivity } from "@/types/models";
import { Prisma } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";

const recipientUserSelect = {
    user: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
} satisfies Prisma.ActivityRecipientInclude;

export async function createUserActivity(data: CreateActivity) {
    const { recipients, ...activity } = data;

    return await prisma.activity.create({
        data: {
            ...activity,
            recipients: {
                create: recipients.map((recipient) => ({
                    userId: recipient.userId,
                    entityId: recipient.entityId ?? undefined,
                    metadata: recipient.metadata ?? undefined,
                })),
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
            recipients: {
                include: recipientUserSelect,
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
                recipients: {
                    include: recipientUserSelect,
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

/**
 * The per-user activity feed, backed by ActivityRecipient so each user sees
 * their own slice (entityId/metadata) of shared/batch activities. Events listed
 * in `excludeEvents` (e.g. draft.expiring) are filtered out at the DB.
 */
export async function findUserActivityFeed(
    userId: string,
    { page = 1, limit = 20, excludeEvents = [] }: { page?: number; limit?: number; excludeEvents?: string[] } = {}
) {
    const skip = (page - 1) * limit;

    const where: Prisma.ActivityRecipientWhereInput = {
        userId,
        ...(excludeEvents.length > 0
            ? { activity: { event: { notIn: excludeEvents } } }
            : {}),
    };

    const [recipients, total] = await Promise.all([
        prisma.activityRecipient.findMany({
            where,
            include: {
                activity: {
                    include: {
                        actor: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: { activity: { createdAt: "desc" } },
            skip,
            take: limit,
        }),
        prisma.activityRecipient.count({ where }),
    ]);

    return { recipients, total };
}
