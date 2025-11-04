import { capitalize, convertToLowerCase } from "@/lib/utils";

import { UpdateUserProfile } from "@/types/utils";
import prisma from "@/lib/prisma";

export async function createUserProfile(userId: string) {
    await prisma.userProfile.create({
        data: { userId, bio: "" },
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
            instruments: convertToLowerCase(instruments || []),
            favoriteGenres: convertToLowerCase(favoriteGenres || []),

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
            profile: {
                select: {
                    id: true,
                    headline: true
                }
            }
        }
    });
}

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