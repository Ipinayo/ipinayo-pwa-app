import { DraftMassSelection } from "@/types/schemas/mass-selections";
import { DraftSelectionFilter } from "@/types/utils";
import { Prisma } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";

export default async function findDraftsByUserId({
    page = 1,
    limit = 12,
    query = '',
}: DraftSelectionFilter, userId: string) {
    const skip = (page - 1) * limit

    // Build where clause with search and filter conditions
    const whereClause: Prisma.MassSelectionDraftWhereInput = {
        createdById: userId, // Base condition - only drafts created by the user
    }

    // Build AND conditions array
    const andConditions: Prisma.MassSelectionDraftWhereInput[] = []

    // Add search functionality
    if (query) {
        andConditions.push({
            OR: [
                { title: { contains: query, mode: "insensitive" } },
                { pastoralFocus: { contains: query, mode: "insensitive" } },
                { liturgy: { contains: query, mode: "insensitive" } },
            ],
        })
    }

    // Only add AND clause if there are conditions
    if (andConditions.length > 0) {
        whereClause.AND = andConditions
    }

    // Get drafts with pagination
    const drafts = await prisma.massSelectionDraft.findMany({
        where: whereClause,
        orderBy: { 'updatedAt': 'asc' },
        skip,
        take: limit,
    })

    const total = await prisma.massSelectionDraft.count({
        where: whereClause,
    })

    return { drafts, total }
}

export async function findDraftById(draftId: string) {
    return await prisma.massSelectionDraft.findUnique({
        where: { id: draftId },
    })
}

export async function createDraft(selection: DraftMassSelection, userId: string) {

    return await prisma.massSelectionDraft.create({
        data: {
            ...selection,
            parishLocation: selection.parishLocation || undefined,
            createdById: userId,
        }
    });
}

export async function updateDraftById(draftId: string, selection: DraftMassSelection, userId: string) {
    return await prisma.massSelectionDraft.update({
        where: { id: draftId, createdById: userId },
        data: {
            ...selection,
            parishLocation: selection.parishLocation || undefined,
        }
    });
}

export async function deleteDraftById(draftId: string, userId: string) {
    return await prisma.massSelectionDraft.delete({
        where: { id: draftId, createdById: userId },
    })
}