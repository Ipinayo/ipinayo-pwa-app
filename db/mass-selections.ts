import { MassSelectionFilter, SortBy, SortOrder } from "@/types/utils";
import { MassSelectionStats, NewMassSelection, NewMassSelectionPart, SingleMassSelectionWithParts } from "@/types/models";

import { Prisma } from "@/lib/generated/prisma";
import { addParishAndChoirInfoToUserProfile } from "./user";
import { capitalize } from "@/lib/utils";
import prisma from "@/lib/prisma";

export async function findSelectionWithParts(id: string) {
    return await prisma.massSelection.findUnique({
        where: { id },
        include: {
            themes: true,
            parishLocation: true,
            parts: { orderBy: { order: "asc" } },
            createdBy: {
                select: { name: true, email: true },
            },
        },
    })
}

export async function findUserSelectionWithParts(id: string, userId: string) {
    return await prisma.massSelection.findUnique({
        where: { id, createdById: userId },
        include: {
            themes: true,
            parishLocation: true,
            parts: { orderBy: { order: "asc" } },
            createdBy: {
                select: { name: true, email: true },
            },
        },
    })
}

export async function findSelection(id: string) {
    return await prisma.massSelection.findUnique({
        where: { id },
        include: {
            themes: { select: { id: true } },
            parts: { orderBy: { order: "asc" } },
        }
    })
}

export async function findUserSelection(id: string, userId: string) {
    return await prisma.massSelection.findUnique({
        where: { id, createdById: userId }
    })
}

export async function findAllSelections({
    page = 1,
    limit = 12,
    query = '',
    season,
    year,
    sortBy = SortBy.UPDATED_AT,
    sortOrder = SortOrder.DESC
}: MassSelectionFilter) {

    const skip = (page - 1) * limit

    // Build where clause with search and filter conditions
    const whereClause: Prisma.MassSelectionWhereInput = {
        isPublic: true, // Base condition - only public selections
    }

    // Build AND conditions array
    const andConditions: Prisma.MassSelectionWhereInput[] = []

    // Add search functionality
    if (query) {
        andConditions.push({
            OR: [
                { title: { contains: query, mode: "insensitive" } },
                { themes: { some: { name: { contains: query } } } },
                { pastoralFocus: { contains: query, mode: "insensitive" } },
                { liturgy: { contains: query, mode: "insensitive" } },
                {
                    parishLocation: {
                        country: { contains: query, mode: "insensitive" },
                        state: { contains: query, mode: "insensitive" },
                        city: { contains: query, mode: "insensitive" },
                        countryCode: { contains: query, mode: "insensitive" },
                        stateCode: { contains: query, mode: "insensitive" },
                        timezone: { contains: query, mode: "insensitive" }
                    }
                },
            ],
        })
    }

    // Add season filter
    if (season) {
        andConditions.push({ liturgicalSeason: season })
    }

    // Add year filter
    if (year) {
        andConditions.push({ liturgicalYear: year })
    }

    // Only add AND clause if there are conditions
    if (andConditions.length > 0) {
        whereClause.AND = andConditions
    }

    // Build order by clause
    const orderBy = {
        [sortBy]: sortOrder
    }

    // Get public selections with filters
    const selections = await prisma.massSelection.findMany({
        where: whereClause,
        include: {
            themes: true,
            parishLocation: true,
            createdBy: {
                select: { name: true, email: true },
            },
            _count: {
                select: { parts: true },
            },
        },
        orderBy,
        skip,
        take: limit,
    })

    const total = await prisma.massSelection.count({
        where: whereClause,
    })

    return { selections, total }
}

export async function findAllUserSelections({
    page = 1,
    limit = 12,
    query = '',
    season,
    year,
    sortBy = SortBy.UPDATED_AT,
    sortOrder = SortOrder.DESC
}: MassSelectionFilter, userId: string) {

    const skip = (page - 1) * limit

    // Build where clause with search and filter conditions
    const whereClause: Prisma.MassSelectionWhereInput = {
        createdById: userId, // Base condition - only user selections
    }

    // Build AND conditions array
    const andConditions: Prisma.MassSelectionWhereInput[] = []

    // Add search functionality
    if (query) {
        andConditions.push({
            OR: [
                { title: { contains: query, mode: "insensitive" } },
                { themes: { some: { name: { contains: query } } } },
                { pastoralFocus: { contains: query, mode: "insensitive" } },
                { liturgy: { contains: query, mode: "insensitive" } },
            ],
        })
    }

    // Add season filter
    if (season) {
        andConditions.push({ liturgicalSeason: season })
    }

    // Add year filter
    if (year) {
        andConditions.push({ liturgicalYear: year })
    }

    // Only add AND clause if there are conditions
    if (andConditions.length > 0) {
        whereClause.AND = andConditions
    }

    // Build order by clause
    const orderBy = {
        [sortBy]: sortOrder
    }

    // Get public selections with filters
    const selections = await prisma.massSelection.findMany({
        where: whereClause,
        include: {
            themes: true,
            parishLocation: true,
            createdBy: {
                select: { name: true, email: true },
            },
            _count: {
                select: { parts: true },
            },
        },
        orderBy,
        skip,
        take: limit,
    })

    const total = await prisma.massSelection.count({
        where: whereClause,
    })

    return { selections, total }
}

export async function saveSelection(selection: NewMassSelection, userId: string) {

    const { parts, date, themes, parishLocation, ...rest } = selection

    const data: Prisma.MassSelectionCreateInput = {
        ...rest,
        date: new Date(date),
        themes: {
            connectOrCreate: themes.map(name => ({
                where: { name: name.toLowerCase() },
                create: { name: name.toLowerCase() }
            }))
        },
        parts: {
            create:
                parts?.map((part) => ({
                    partName: part.partName.toLowerCase(),
                    order: part.order,
                    keySignature: part.keySignature,
                    notes: part.notes,
                    songTitle: part.songTitle,
                })) || [],
        },
        createdBy: {
            connect: { id: userId }
        },
    }

    if (parishLocation && parishLocation.country) {
        data.parishLocation = {
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
        }
    }

    const createdSelection = await prisma.massSelection.create({
        data
    })

    addParishAndChoirInfoToUserProfile(userId, createdSelection.parishLocationId, createdSelection.choirName, createdSelection.parishName);

    return createdSelection;
}

export async function updateSelection(
    selection: Partial<NewMassSelection>,
    id: string,
) {
    const { parts, date, themes, parishLocation, ...rest } = selection


    let partsToCreate: NewMassSelectionPart[] = [];
    let partsToUpdate: NewMassSelectionPart[] = [];
    let idsToDelete: string[] = [];

    if (parts) {

        // Get existing part IDs
        const existingParts = await prisma.massPart.findMany({
            where: { massSelectionId: id },
            select: { id: true },
        });

        const existingIds = new Set(existingParts.map(p => p.id));
        partsToUpdate = parts.filter(p => existingIds.has(p.id));
        partsToCreate = parts.filter(p => !existingIds.has(p.id));
        // Correct deletion logic: delete any existing part not present in incoming parts
        idsToDelete = [...existingIds].filter(id => !parts.some(p => p.id === id));

    }

    // Do updates outside the nested write
    await prisma.$transaction([
        // 1. Delete removed parts
        ...(idsToDelete.length > 0 ? [
            prisma.massPart.deleteMany({
                where: { id: { in: idsToDelete } },
            })
        ] : []),

        // 2. Update existing parts
        ...partsToUpdate.map((part) =>
            prisma.massPart.update({
                where: { id: part.id },
                data: {
                    partName: part.partName,
                    songTitle: part.songTitle,
                    keySignature: part.keySignature,
                    notes: part.notes,
                    order: part.order,
                },
            })
        ),

        // 3. Update mass selection with new parts
        prisma.massSelection.update({
            where: { id },
            data: {
                ...rest,
                ...(date && { date: new Date(date) }),
                ...(themes && {
                    themes: {
                        set: [], // Disconnect all existing
                        connectOrCreate: themes.map(name => ({
                            where: { name: name.toLowerCase() },
                            create: { name: name.toLowerCase() }
                        }))
                    }
                }),
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
                    }
                }),
                parts: {
                    create: partsToCreate.map((part) => ({
                        partName: part.partName.toLowerCase(),
                        songTitle: part.songTitle,
                        keySignature: part.keySignature,
                        notes: part.notes,
                        order: part.order,
                    })),
                },
            },
        }),
    ]);
}

export async function removeSelection(id: string) {
    return await prisma.massSelection.delete({
        where: { id },
    })
}

export async function findAllThemes() {
    return await prisma.theme.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function findMassSelectionStats(
    userId: string
): Promise<MassSelectionStats> {
    const stats = await prisma.$queryRaw<MassSelectionStats[]>`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE "isPublic" = true)::int AS public,
      COUNT(*) FILTER (WHERE "isPublic" = false)::int AS private,
      COUNT(*) FILTER (WHERE "createdAt" >= date_trunc('month', now()))::int AS "thisMonth",
      COUNT(*) FILTER (WHERE "createdAt" >= date_trunc('week', now()))::int AS "thisWeek"
    FROM "MassSelection"
    WHERE "createdById" = ${userId};
  `

    // $queryRaw returns an array of rows, so we take the first one
    return stats[0]
}

export async function saveSelectionBySelection(selection: SingleMassSelectionWithParts, userId: string) {
    const { themes, parts, createdById, id, createdAt, updatedAt, ...rest } = selection;


    return await prisma.massSelection.create({
        data: {
            ...rest,
            themes: themes.length > 0
                ? { connect: themes.map((t) => ({ id: t.id })) }
                : undefined,
            parts: {
                create: parts.map((part) => ({
                    partName: part.partName.toLowerCase(),
                    order: part.order,
                    keySignature: part.keySignature,
                    notes: part.notes,
                    songTitle: part.songTitle,
                })),
            },
            createdById: userId,
        },
    })
}

export async function findAllPartNames() {
    return await prisma.massPart.findMany({
        distinct: ['partName'],
        select: { partName: true },
        orderBy: { partName: 'asc' }
    });

}