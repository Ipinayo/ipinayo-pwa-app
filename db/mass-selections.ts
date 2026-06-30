import { MassSelectionFilter, SortBy, SortOrder } from "@/types/utils";
import { MassSelectionStats, NewMassSelection, NewMassSelectionPart } from "@/types/models";
import { Prisma, UserRole } from "@/lib/generated/prisma/client";
import { capitalize, getCurrentWeekRange } from "@/lib/utils";

import prisma from "@/lib/prisma";

export async function findSelectionWithParts(id: string) {
    return await prisma.massSelection.findUnique({
        where: { id },
        include: {
            themes: true,
            parishLocation: true,
            parts: { orderBy: { order: "asc" } },
            createdBy: {
                select: { name: true, email: true, userRole: true },
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
                select: { name: true, email: true, userRole: true },
            },
        },
    })
}

export async function findSelection(id: string) {
    return await prisma.massSelection.findUnique({
        where: { id },
        include: {
            themes: true,
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
    sortOrder = SortOrder.DESC,
    isPublic,
    isFeatured
}: MassSelectionFilter) {

    const skip = (page - 1) * limit

    // Build where clause with search and filter conditions
    const whereClause: Prisma.MassSelectionWhereInput = {}

    if (isPublic !== undefined) { whereClause.isPublic = isPublic }
    if (isFeatured !== undefined) { whereClause.isFeatured = isFeatured }

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

    const include = {
        themes: true,
        parishLocation: true,
        createdBy: {
            select: { name: true, email: true, userRole: true },
        },
        _count: {
            select: { parts: true },
        },
    } as const

    const featuredSort = sortBy === SortBy.FEATURED
    const hasFilters = Boolean(query || season || year)

    // "Featured first" sort, unfiltered: pin THIS WEEK's featured to the very top
    if (featuredSort && !hasFilters) {
        const { start, end } = getCurrentWeekRange()
        const currentWeekFeatured: Prisma.MassSelectionWhereInput = {
            isFeatured: true,
            date: { gte: start, lte: end },
        }
        const pinnedWhere: Prisma.MassSelectionWhereInput = {
            AND: [whereClause, currentWeekFeatured],
        }
        const mainWhere: Prisma.MassSelectionWhereInput = {
            AND: [whereClause, { NOT: currentWeekFeatured }],
        }

        const [pinnedTotal, mainTotal] = await Promise.all([
            prisma.massSelection.count({ where: pinnedWhere }),
            prisma.massSelection.count({ where: mainWhere }),
        ])

        // Combined sequence is [current-week featured..., everything else...]; page over it
        const pinned = skip < pinnedTotal
            ? await prisma.massSelection.findMany({
                where: pinnedWhere,
                include,
                orderBy: { date: "desc" },
                skip,
                take: limit,
            })
            : []

        const remaining = limit - pinned.length
        const main = remaining > 0
            ? await prisma.massSelection.findMany({
                where: mainWhere,
                include,
                orderBy: { date: "desc" },
                skip: Math.max(0, skip - pinnedTotal),
                take: remaining,
            })
            : []

        return { selections: [...pinned, ...main], total: pinnedTotal + mainTotal }
    }

    // "Featured first" WITH a search/filter → all featured surface first 
    const orderBy: Prisma.MassSelectionOrderByWithRelationInput[] = featuredSort
        ? [{ [sortBy]: sortOrder }, { date: "desc" }]
        : [{ [sortBy]: sortOrder }]

    const selections = await prisma.massSelection.findMany({
        where: whereClause,
        include,
        orderBy,
        skip,
        take: limit,
    })

    const total = await prisma.massSelection.count({
        where: whereClause,
    })

    return { selections, total }
}

export async function findFeaturedSelections(limit?: number) {
    const { start, end } = getCurrentWeekRange()

    return await prisma.massSelection.findMany({
        where: {
            isFeatured: true,
            isPublic: true,
            date: { gte: start, lte: end },
        },
        include: {
            themes: true,
            parishLocation: true,
            createdBy: {
                select: { name: true, email: true, userRole: true },
            },
            _count: {
                select: { parts: true },
            },
        },
        orderBy: { date: "asc" },
        ...(limit ? { take: limit } : {}),
    })
}

export async function findAllUserSelections({
    page = 1,
    limit = 12,
    query = '',
    season,
    year,
    sortBy = SortBy.UPDATED_AT,
    sortOrder = SortOrder.DESC,
    isPublic
}: MassSelectionFilter, userId: string) {

    const skip = (page - 1) * limit

    // Build where clause with search and filter conditions
    const whereClause: Prisma.MassSelectionWhereInput = {
        createdById: userId, // Base condition - only user selections
    }

    if (isPublic !== undefined) { whereClause.isPublic = isPublic; }

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
                select: { name: true, email: true, userRole: true },
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

export async function saveSelection(selection: NewMassSelection, userId: string, draftId: string) {

    const { parts, date, themes, parishLocation, ...rest } = selection

    // Ownership stays with the draft's creator, even when a manage-level
    // collaborator is the one promoting it.
    const draft = await prisma.massSelectionDraft.findUnique({
        where: { id: draftId },
        select: { createdById: true, groupId: true },
    })
    const ownerId = draft?.createdById ?? userId

    // A public selection by a featured author is part of the featured bank.
    const owner = await prisma.user.findUnique({
        where: { id: ownerId },
        select: { userRole: true },
    })
    const isFeatured =
        rest.isPublic === true && owner?.userRole === UserRole.FEATURED_AUTHOR

    const data: Prisma.MassSelectionCreateInput = {
        ...rest,
        isFeatured,
        date: date,
        themes: {
            connectOrCreate: themes.map(name => ({
                where: { name: name.toLowerCase() },
                create: { name: name.toLowerCase() }
            }))
        },
        parts: {
            create:
                parts?.map((part) => ({
                    partName: part.partName,
                    order: part.order,
                    keySignature: part.keySignature,
                    notes: part.notes,
                    songTitle: part.songTitle,
                })) || [],
        },
        createdBy: {
            connect: { id: ownerId }
        },

        group: draft?.groupId
            ? { connect: { id: draft.groupId } }
            : { create: { ownerId } },
    }

    if (parishLocation?.country) {
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

    const createdSelection = await prisma.$transaction(async (tx) => {
        const selection = await tx.massSelection.create({
            data
        })

        await tx.massSelectionDraft.delete({
            where: { id: draftId }
        })

        return selection;

    });

    return createdSelection;
}

export async function updateSelection(
    selection: Partial<NewMassSelection>,
    id: string,
) {
    const { parts, date, themes, parishLocation, ...rest } = selection

    // Recompute featured status. It's sticky: once featured it stays featured
    // (so role revocation never retroactively un-features valid past work), and
    // a featured author publishing turns it on.
    const current = await prisma.massSelection.findUnique({
        where: { id },
        select: {
            isFeatured: true,
            isPublic: true,
            createdBy: { select: { userRole: true } },
        },
    })
    const effectiveIsPublic = rest.isPublic ?? current?.isPublic ?? false
    const isFeatured =
        (current?.isFeatured ?? false) ||
        (current?.createdBy.userRole === UserRole.FEATURED_AUTHOR &&
            effectiveIsPublic)

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
        // Delete any existing part not present in incoming parts
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
                isFeatured,
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
                ...(parishLocation?.country && {
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
                        partName: part.partName,
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
    return await prisma.$transaction(async (tx) => {
        const selection = await tx.massSelection.findUnique({
            where: { id },
            select: {
                groupId: true,
                group: {
                    select: {
                        name: true,
                        _count: { select: { selections: true, drafts: true } },
                    },
                },
            },
        })

        const deleted = await tx.massSelection.delete({ where: { id } })

        // Drop the ad-hoc group once it no longer backs any entity. Named groups
        // are reusable and left intact.
        if (
            selection?.group.name === null &&
            selection.group._count.drafts === 0 &&
            selection.group._count.selections === 1
        ) {
            await tx.collaboratorGroup.delete({ where: { id: selection.groupId } })
        }

        return deleted
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
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [
        total,
        publicCount,
        privateCount,
        thisMonth,
        thisWeek,
        totalDrafts
    ] = await Promise.all([
        prisma.massSelection.count({
            where: { createdById: userId }
        }),
        prisma.massSelection.count({
            where: { createdById: userId, isPublic: true }
        }),
        prisma.massSelection.count({
            where: { createdById: userId, isPublic: false }
        }),
        prisma.massSelection.count({
            where: {
                createdById: userId,
                createdAt: { gte: startOfMonth }
            }
        }),
        prisma.massSelection.count({
            where: {
                createdById: userId,
                createdAt: { gte: startOfWeek }
            }
        }),
        prisma.massSelectionDraft.count({
            where: {
                createdById: userId,
            }
        })
    ]);

    return {
        total,
        public: publicCount,
        private: privateCount,
        thisMonth,
        thisWeek,
        totalDrafts
    };
}

export async function findAllPartNames() {
    return await prisma.massPart.findMany({
        distinct: ['partName'],
        select: { partName: true },
        orderBy: { partName: 'asc' }
    });

}