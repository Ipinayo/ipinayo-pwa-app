import { Prisma } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";

export async function createAnnouncement(data: Prisma.AnnouncementCreateInput) {
    return await prisma.announcement.create({
        data,
        include: {
            createdBy: { select: { id: true, name: true, email: true } },
        },
    });
}

export async function updateAnnouncement(id: string, data: Prisma.AnnouncementUpdateInput) {
    return await prisma.announcement.update({
        where: { id },
        data,
    });
}

export async function findAllAnnouncements({
    page = 1,
    limit = 20,
    type,
}: {
    page?: number;
    limit?: number;
    type?: string;
} = {}) {
    const skip = (page - 1) * limit;

    const where: Prisma.AnnouncementWhereInput = {};
    if (type && type !== "all") {
        where.type = type;
    }

    const [announcements, total] = await Promise.all([
        prisma.announcement.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
                createdBy: { select: { id: true, name: true, email: true } },
            },
        }),
        prisma.announcement.count({ where }),
    ]);

    return { announcements, total };
}

export async function countAnnouncementStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [total, thisMonth, thisWeek] = await Promise.all([
        prisma.announcement.count(),
        prisma.announcement.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.announcement.count({ where: { createdAt: { gte: startOfWeek } } }),
    ]);

    return { total, thisMonth, thisWeek };
}
