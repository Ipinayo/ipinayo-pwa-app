import { UpdateUserProfile } from "@/types/utils";
import { capitalize } from "@/lib/utils";
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

    const { parishLocation, name, ...data } = updates;

    return await prisma.userProfile.update({
        where: { userId },
        data: {
            ...data,

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
                    headline: true
                }
            }
        }
    });
}

export async function addLocationToUserProfile(userId: string, locationId: string) {
    if (!locationId) return;

    await prisma.userProfile.updateMany({
        where: {
            userId,
            parishLocationId: null
        },
        data: {
            parishLocationId: locationId
        }
    });
}
