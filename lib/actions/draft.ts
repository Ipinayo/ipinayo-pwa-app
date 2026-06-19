'use server';

import { Permission, can } from "@/lib/collaboration-utils";
import { findDraftMeta, findDraftStakeholderIds } from "@/db/collaborators";
import findDraftsByUserId, { createDraft, deleteDraftById, findDraftById, updateDraftById } from "@/db/draft";

import { DraftMassSelection } from "@/types/schemas/mass-selections";
import { DraftSelectionFilter } from "@/types/utils";
import { auth } from "@/auth";
import { createActivity } from "@/lib/notifications/dispatch";
import { findUserParishAndChoirInfo } from "@/db/user";
import { getDraftAccess } from "@/lib/actions/collaboration";
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

        const access = await getDraftAccess(id, session.user.id);
        if (!can(access, Permission.View)) {
            throw new Error("Unauthorized");
        }

        return draft;
    } catch (error: any) {
        console.error("Error fetching draft:", error);
        throw new Error("Error fetching draft: " + error?.message);
    }
}

export async function getAllDrafts({ page = 1,
    limit = 12,
    query = '', }: DraftSelectionFilter) {
    try {

        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const { drafts, total } = await findDraftsByUserId({ page, limit, query }, session.user.id);
        return {
            drafts: drafts,
            pagination: {
                page,
                limit,
                total: total,
                pages: Math.ceil(total / limit),
            },
        };
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

        createActivity({
            targetUsers: [session.user.id],
            event: "draft.created_by_self",
            entityId: newDraft.id,
            metadata: {},
            actorId: session.user.id,
        });

        revalidatePath('/liturgical-selections/new');
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/drafts');

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

        const access = await getDraftAccess(id, session.user.id);
        if (!can(access, Permission.Edit)) {
            throw new Error("You don't have edit access to this draft");
        }

        const updatedDraft = await updateDraftById(id, selection);

        const title = updatedDraft.title || "Untitled Draft";

        // The actor's own feed record.
        createActivity({
            targetUsers: [session.user.id],
            event: "draft.updated_by_self",
            entityId: updatedDraft.id,
            metadata: { title },
            actorId: session.user.id,
        });

        // Notify everyone else with access that a shared draft changed.
        const stakeholders = await findDraftStakeholderIds(id);
        const others = stakeholders.filter((uid) => uid !== session.user.id);
        if (others.length > 0) {
            createActivity({
                targetUsers: others,
                event: "draft.updated_by_other",
                entityId: updatedDraft.id,
                metadata: { title, actorName: session.user.name || session.user.email || "Someone" },
                actorId: session.user.id,
            });
        }

        revalidatePath('/liturgical-selections/new');
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/drafts');

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

        const access = await getDraftAccess(id, session.user.id);
        if (!can(access, Permission.Manage)) {
            throw new Error("You don't have permission to delete this draft");
        }

        const draft = await findDraftMeta(id);
        const title = draft?.title || "Untitled Draft";

        // Capture everyone with access before the cascade delete removes the rows.
        const stakeholders = await findDraftStakeholderIds(id);

        await deleteDraftById(id);

        createActivity({
            targetUsers: [session.user.id],
            event: "draft.deleted_by_self",
            entityId: id,
            metadata: { title },
            actorId: session.user.id,
        });

        // Notify everyone else with access that the shared draft was deleted.
        const others = stakeholders.filter((uid) => uid !== session.user.id);
        if (others.length > 0) {
            createActivity({
                targetUsers: others,
                event: "draft.deleted_by_other",
                entityId: id,
                metadata: { title, actorName: session.user.name || session.user.email || "Someone", expired: false },
                actorId: session.user.id,
            });
        }

        revalidatePath('/liturgical-selections/new');
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/drafts');

    } catch (error: any) {
        console.error("Error deleting draft:", error);
        throw new Error("Error deleting draft: " + error?.message);
    }
}