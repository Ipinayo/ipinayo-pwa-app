'use server';

import findDraftsByUserId, { createDraft, deleteDraftById, findDraftById, updateDraftById } from "@/db/draft";

import { DraftMassSelection } from "@/types/schemas/mass-selections";
import { auth } from "@/auth";

export async function getDraftById(id: string, userId: string) {
    try {

        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const draft = await findDraftById(id);
        if (!draft) {
            throw new Error("Draft not found");
        }
        return draft;
    } catch (error: any) {
        console.error("Error fetching draft:", error);
        throw new Error("Error fetching draft: " + error?.message);
    }
}

export async function getAllDrafts() {
    try {

        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const drafts = await findDraftsByUserId(session.user.id);
        return drafts;
    } catch (error: any) {
        console.error("Error fetching drafts:", error);
        throw new Error("Error fetching drafts: " + error?.message);
    }
}

export async function upsertDraft(selection: DraftMassSelection, id?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        let updatedDraft;
        if (id)
            updatedDraft = await updateDraftById(id, selection, session.user.id);
        else
            updatedDraft = await createDraft(selection, session.user.id);

        return updatedDraft;
    } catch (error: any) {
        console.error("Error updating draft:", error);
        throw new Error("Error updating draft: " + error?.message);
    }
}

export async function deleteDraft(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        await deleteDraftById(id, session.user.id);
    } catch (error: any) {
        console.error("Error deleting draft:", error);
        throw new Error("Error deleting draft: " + error?.message);
    }
}