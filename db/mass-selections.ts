import { MassSelectionFilter, SortBy, SortOrder } from "@/types/utils";

import { NewMassSelection } from "@/types/models";
import { Prisma } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";

export async function findSelectionWithParts(id: string) {
    return await prisma.massSelection.findUnique({
        where: { id },
        include: {
            themes: true,
            parts: true,
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
            parts: true,
            createdBy: {
                select: { name: true, email: true },
            },
        },
    })
}

export async function findSelection(id: string) {
    return await prisma.massSelection.findUnique({
        where: { id }
    })
}

export async function findUserSelection(id: string, userId: string) {
    return await prisma.massSelection.findUnique({
        where: { id, createdById: userId }
    })
}

export async function findAllSelections({
    page = 1,
    limit = 9,
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
    limit = 9,
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

    return await prisma.massSelection.create({
        data: {
            title: selection.title,
            date: new Date(selection.date),
            liturgicalYear: selection.liturgicalYear,
            liturgicalSeason: selection.liturgicalSeason,
            liturgy: selection.liturgy,
            themes: {
                connectOrCreate: selection.themes.map(name => ({
                    where: { name: name.toLowerCase() },
                    create: { name: name.toLowerCase() }
                }))
            },
            pastoralFocus: selection.pastoralFocus,
            isPublic: selection.isPublic,
            createdById: userId,
            parts: {
                create:
                    selection.parts?.map((part) => ({
                        partName: part.partName,
                        keySignature: part.keySignature,
                        notes: part.notes,
                        songTitle: part.songTitle,
                    })) || [],
            },
        },
        include: {
            parts: true,
            createdBy: {
                select: { name: true, email: true },
            },
        },
    })

}

export async function updateSelection(
    selection: Partial<NewMassSelection>,
    id: string,
) {
    const { parts, date, themes, ...rest } = selection

    return await prisma.massSelection.update({
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
            ...(parts && {
                parts: {
                    deleteMany: {},
                    create: parts.map((part) => ({
                        partName: part.partName,
                        keySignature: part.keySignature,
                        notes: part.notes,
                        songTitle: part.songTitle,
                    })),
                },
            }),
        },
        include: {
            parts: true,
            createdBy: {
                select: { name: true, email: true },
            },
        },
    })
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