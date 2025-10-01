'use server'

import { MassSelectionFilter, SortBy, SortOrder } from "@/types/utils";

import prisma from "../prisma"

export async function getSelections({
    page = 1,
    limit = 9,
    query = '',
    season,
    year,
    sortBy = SortBy.UPDATED_AT,
    sortOrder = SortOrder.DESC
}: MassSelectionFilter) {

    try {
        const skip = (page - 1) * limit

        // Build where clause with search and filter conditions
        const whereClause: any = {
            OR: [{ isPublic: true }],
        }

        // Build AND conditions array
        const andConditions: any[] = []

        // Add search functionality
        if (query) {
            andConditions.push({
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { themes: { contains: query, mode: "insensitive" } },
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

        return {
            selections,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        }
    } catch (error: any) {
        console.error("Error fetching mass selections:", error)
        throw new Error("Error fetching mass selections: " + error?.message)
    }
}