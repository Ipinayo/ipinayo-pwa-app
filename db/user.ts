import { SortOrder, SortUsersBy, UpdateUserProfile, UsersFilter } from "@/types/utils";

import { Prisma } from "@/lib/generated/prisma";
import { capitalize } from "@/lib/utils";
import prisma from "@/lib/prisma";

export async function createUserProfile(userId: string) {
    return await prisma.userProfile.create({
        data: { userId, bio: "" },
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                }
            },
        }
    })
}

export async function findUserProfile(userId: string) {
    const profile = await prisma.userProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                    image: true,
                    userRole: true,
                    createdAt: true
                }
            },
            parishLocation: true
        }
    });

    return profile ?? prisma.userProfile.create({
        data: { userId, bio: "" },
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                    image: true,
                    userRole: true,
                    createdAt: true
                }
            },
            parishLocation: true
        }
    });
}

export async function updateUserProfile(userId: string, updates: UpdateUserProfile) {

    const { parishLocation, name, instruments, favoriteGenres, ...data } = updates;

    return await prisma.userProfile.update({
        where: { userId },
        data: {
            ...data,
            instruments: instruments ? { set: instruments } : undefined,
            favoriteGenres: favoriteGenres ? { set: favoriteGenres } : undefined,

            // Handle location update
            ...(parishLocation && parishLocation.country && {
                parishLocation: {
                    connectOrCreate: {
                        where: {
                            country_state_city: {
                                country: parishLocation.country,
                                state: parishLocation.state || '',
                                city: capitalize(parishLocation.city || ''),
                            }
                        },
                        create: {
                            country: parishLocation.country,
                            countryCode: parishLocation.countryCode,
                            state: parishLocation.state,
                            stateCode: parishLocation.stateCode,
                            city: capitalize(parishLocation.city || ''),
                            latitude: parishLocation.latitude,
                            longitude: parishLocation.longitude,
                            timezone: parishLocation.timezone,
                        }
                    }
                },
                ...(name
                    ? { user: { update: { name } } }
                    : {}),
            }),
        },
    });
}

export async function findUser(userId: string) {
    return await prisma.user.findUnique({
        where: { id: userId },
        select: {
            name: true,
            email: true,
            image: true,
            userRole: true,
            profile: {
                select: {
                    id: true,
                    headline: true
                }
            }
        }
    });
}

// Add parish and choir info only if they don't exist
// Using COALESCE to avoid overwriting existing data
export async function addParishAndChoirInfoToUserProfile(
    userId: string,
    locationId?: string | null,
    choirName?: string | null,
    parishName?: string | null
) {
    if (!locationId && !choirName && !parishName) return;

    await prisma.$executeRaw`
        UPDATE "UserProfile"
        SET 
            "parishLocationId" = COALESCE("parishLocationId", ${locationId}),
            "choirName" = COALESCE("choirName", ${choirName}),
            "parishName" = COALESCE("parishName", ${parishName})
        WHERE "userId" = ${userId}
    `;
}

export async function findUserParishAndChoirInfo(userId: string) {
    return await prisma.userProfile.findUnique({
        where: { userId },
        select: {
            choirName: true,
            parishName: true,
            parishLocation: true
        }
    });
}

export default async function findAllUsers({
    page = 1,
    limit = 12,
    query = '',
    userRole,
    sortBy = SortUsersBy.CREATED_AT,
    sortOrder = SortOrder.DESC
}: UsersFilter) {
    const skip = (page - 1) * limit

    // Build where clause with search and filter conditions
    const whereClause: Prisma.UserWhereInput = {}

    // Build AND conditions array
    const andConditions: Prisma.UserWhereInput[] = []

    // Add search functionality
    if (query) {
        andConditions.push({
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
            ],
        })
    }

    // Add user role filter
    if (userRole) {
        andConditions.push({ userRole })
    }

    // Only add AND clause if there are conditions
    if (andConditions.length > 0) {
        whereClause.AND = andConditions
    }

    // Build order by clause
    const orderBy = {
        [sortBy]: sortOrder
    }

    // Get users with pagination
    const users = await prisma.user.findMany({
        where: whereClause,
        include: {
            _count: {
                select: {
                    selections: true,
                    massSelectionDrafts: true
                },
            },
        },
        orderBy,
        skip,
        take: limit,
    })

    const total = await prisma.user.count({
        where: whereClause,
    })

    return { users, total }
}