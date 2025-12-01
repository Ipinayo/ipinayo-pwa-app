import { DraftMassSelection } from "@/types/schemas/mass-selections";
import prisma from "@/lib/prisma";

export default async function findDraftsByUserId(userId: string) {
    return await prisma.massSelectionDraft.findMany({
        where: { createdById: userId }
    })
}

export async function findDraftById(draftId: string) {
    return await prisma.massSelectionDraft.findUnique({
        where: { id: draftId },
        include: {
            createdBy: {
                select: { name: true, email: true },
            },
        },
    })
}

export async function createDraft(selection: DraftMassSelection, userId: string) {

    return await prisma.massSelectionDraft.create({
        data: {
            ...selection,
            title: selection.title || 'Untitled Draft',
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
            title: selection.title || 'Untitled Draft',
            parishLocation: selection.parishLocation || undefined,
            createdById: userId,
        }
    });
}

export async function deleteDraftById(draftId: string, userId: string) {
    return await prisma.massSelectionDraft.delete({
        where: { id: draftId, createdById: userId },
    })
}