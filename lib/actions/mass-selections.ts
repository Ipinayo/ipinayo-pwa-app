'use server'

import { MassSelectionFilter } from "@/types/utils";
import prisma from "../prisma"

export async function getSelections({ page = 1, limit = 9, query = '', season = 'all', year = 'all', sortBy = 'updatedAt', sortOrder = 'desc' }: MassSelectionFilter) {

    try {

        const skip = (page - 1) * limit

        // Build where clause with search and filter conditions
        const whereClause: any = {
            OR: [{ isPublic: true }],
        }

        // Add search functionality
        if (query) {
            whereClause.AND = [
                {
                    OR: [
                        { title: { contains: query, mode: "insensitive" } },
                        { themes: { contains: query, mode: "insensitive" } },
                        { pastoralFocus: { contains: query, mode: "insensitive" } },
                        { liturgy: { contains: query, mode: "insensitive" } },
                    ],
                },
            ]
        }

        // Add season filter
        if (!season.toLowerCase().includes("all")) {
            if (whereClause.AND) {
                whereClause.AND.push({ liturgicalSeason: season })
            } else {
                whereClause.AND = [{ liturgicalSeason: season }]
            }
        }

        // Add year filter
        if (year !== "all") {
            if (whereClause.AND) {
                whereClause.AND.push({ liturgicalYear: year })
            } else {
                whereClause.AND = [{ liturgicalYear: year }]
            }
        }

        // Build order by clause
        const orderBy: any = {}
        if (sortBy === "title" || sortBy === "date" || sortBy === "updatedAt" || sortBy === "createdAt") {
            orderBy[sortBy] = sortOrder
        } else {
            orderBy.updatedAt = "desc"
        }

        // Get user's own selections + public selections
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