'use server';

import findDraftsByUserId, { createDraft, deleteDraftById, findDraftById, updateDraftById } from "@/db/draft";

import { DraftMassSelection } from "@/types/schemas/mass-selections";
import { auth } from "@/auth";
import { findUserParishAndChoirInfo } from "@/db/user";
import { liturgyTemplates } from "../constants";
import { revalidatePath } from "next/cache";

export async function getDraftById(id: string) {
    try {

        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const draft = await findDraftById(id);
        if (!draft) {
            throw new Error("Draft not found");
        }
        if (draft.createdById !== session.user.id) {
            throw new Error("Unauthorized");
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

export async function createNewDraft(templateId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const info = await findUserParishAndChoirInfo(session.user.id);

        const liturgy = liturgyTemplates.find((temp) => temp.id === templateId);
        const parts = liturgy?.parts || [];

        const initialParts =
            parts.length > 0
                ? parts.map((partName, index) => ({
                    id: `temp-${(index + 1).toString()}`,
                    order: index,
                    partName,
                    keySignature: null,
                    notes: "",
                    songTitle: "",
                }))
                : [
                    {
                        id: "temp-1",
                        order: 0,
                        partName: "",
                        keySignature: null,
                        notes: "",
                        songTitle: "",
                    },
                ];

        const draft = {
            title: "",
            date: new Date(),
            liturgicalYear: null,
            liturgicalSeason: null,
            themes: liturgy?.themes || [],
            pastoralFocus: "",
            liturgy: liturgy?.liturgy || "",
            isPublic: true,
            parishLocation: info?.parishLocation,
            choirName: info?.choirName,
            parishName: info?.parishName,
            template: liturgy?.name,
            parts: initialParts,
        };

        const newDraft = await createDraft(draft, session.user.id);
        return newDraft;
    } catch (error: any) {
        console.error("Error creating draft:", error);
        throw new Error("Error creating draft: " + error?.message);
    }
}

export async function updateDraft(id: string, selection: DraftMassSelection) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        let updatedDraft;
        if (id)
            updatedDraft = await updateDraftById(id, selection, session.user.id);

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

        revalidatePath('/liturgical-selections/new');
        revalidatePath('/dashboard/drafts');

    } catch (error: any) {
        console.error("Error deleting draft:", error);
        throw new Error("Error deleting draft: " + error?.message);
    }
}