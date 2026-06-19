'use server'

import { MassSelectionFilter, SortBy, SortOrder } from "@/types/utils";
import { Permission, can } from "@/lib/collaboration-utils";
import { createMassSelectionSchema, updateMassSelectionSchema } from "@/types/schemas/mass-selections";
import {
    findAllPartNames,
    findAllSelections,
    findAllThemes,
    findAllUserSelections,
    findMassSelectionStats,
    findSelection,
    findSelectionWithParts,
    removeSelection,
    saveSelection,
    updateSelection as updateSelectionDb
} from "@/db/mass-selections";
import { getDraftAccess, getSelectionAccess } from "@/lib/actions/collaboration";

import { NewMassSelection } from "@/types/models";
import { auth } from "@/auth";
import { createActivity } from "@/lib/notifications/dispatch";
import { createDraft } from "@/db/draft";
import { findSelectionStakeholderIds } from "@/db/collaborators";
import { findUserParishAndChoirInfo } from "@/db/user";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Get all selections (public)
export async function getSelections({
    page = 1,
    limit = 12,
    query = '',
    season,
    year,
    sortBy = SortBy.DATE,
    sortOrder = SortOrder.DESC,
    isPublic
}: MassSelectionFilter) {
    try {
        const { selections, total } = await findAllSelections({
            page,
            limit,
            query,
            season,
            sortBy,
            sortOrder,
            year,
            isPublic
        });

        return {
            selections,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error: any) {
        console.error("Error fetching mass selections:", error);
        throw new Error("Error fetching mass selections: " + error?.message);
    }
}

// Get user selections
export async function getUserSelections({
    page = 1,
    limit = 12,
    query = '',
    season,
    year,
    sortBy = SortBy.DATE,
    sortOrder = SortOrder.DESC,
    isPublic
}: MassSelectionFilter) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const { selections, total } = await findAllUserSelections({
            page,
            limit,
            query,
            season,
            sortBy,
            sortOrder,
            year,
            isPublic
        }, session.user.id);

        return {
            selections,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error: any) {
        console.error("Error fetching user selections:", error);
        throw new Error("Error fetching user selections: " + error?.message);
    }
}

// Get selection by ID
export async function getSelectionById(id: string) {
    try {
        const selection = await findSelectionWithParts(id);
        if (!selection) {
            throw new Error("Mass selection not found");
        }

        const session = await auth();
        const access = await getSelectionAccess(id, session?.user?.id);
        if (!can(access, Permission.View)) {
            throw new Error("Unauthorized");
        }

        return selection;
    } catch (error: any) {
        console.error("Error fetching mass selection:", error);
        throw new Error("Error fetching mass selection: " + error?.message);
    }
}

// Create new selection with validation
export async function createSelection(data: NewMassSelection, draftId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Only someone with manage access on the draft can promote it.
        const draftAccess = await getDraftAccess(draftId, session.user.id);
        if (!can(draftAccess, Permission.Manage)) {
            throw new Error("You don't have permission to save this draft as a selection");
        }

        // Validate data
        const validationResult = createMassSelectionSchema.safeParse(data);
        if (!validationResult.success) {
            throw new Error(validationResult.error.message);
        }

        const result = await saveSelection(validationResult.data, session.user.id, draftId);

        createActivity({
            targetUsers: [result.createdById],
            event: "selection.created_by_self",
            entityId: result.id,
            metadata: { title: result.title },
            actorId: session.user.id,
        })

        revalidatePath('/liturgical-selections');
        revalidatePath('/liturgical-selections/new');
        revalidatePath('/dashboard');

        return result;

    } catch (error: any) {
        console.error("Error creating mass selection:", error);
        throw new Error("Error creating mass selection: " + error?.message);
    }
}

// Update selection with validation
export async function updateSelection(id: string, data: Partial<NewMassSelection>) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const access = await getSelectionAccess(id, session.user.id);
        if (!can(access, Permission.Edit)) {
            throw new Error("You don't have edit access to this selection");
        }

        const existingSelection = await findSelection(id);
        if (!existingSelection) {
            throw new Error("Mass selection not found");
        }

        // Validate partial data
        const validationResult = updateMassSelectionSchema.safeParse(data);
        if (!validationResult.success) {
            throw new Error(validationResult.error.message);
        }

        const result = await updateSelectionDb(validationResult.data, id);

        const title = data.title || existingSelection.title;

        // The actor's own feed record.
        createActivity({
            targetUsers: [session.user.id],
            event: "selection.updated_by_self",
            entityId: existingSelection.id,
            metadata: { title },
            actorId: session.user.id,
        })

        // Notify everyone else with access that a shared selection changed.
        const stakeholders = await findSelectionStakeholderIds(id);
        const others = stakeholders.filter((uid) => uid !== session.user.id);
        if (others.length > 0) {
            createActivity({
                targetUsers: others,
                event: "selection.updated_by_other",
                entityId: existingSelection.id,
                metadata: { title, actorName: session.user.name || session.user.email || "Someone" },
                actorId: session.user.id,
            })
        }

        revalidatePath('/liturgical-selections');
        revalidatePath(`/liturgical-selections/${id}`);
        revalidatePath('/dashboard');

        return result;
    } catch (error: any) {
        console.error("Error updating mass selection:", error);
        throw new Error("Error updating mass selection: " + error?.message);
    }
}

// Delete selection
export async function deleteSelection(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const access = await getSelectionAccess(id, session.user.id);
        if (!can(access, Permission.Manage)) {
            throw new Error("You don't have permission to delete this selection");
        }

        const existingSelection = await findSelection(id);
        if (!existingSelection) {
            throw new Error("Mass selection not found");
        }

        // Capture everyone with access before the cascade delete removes the rows.
        const stakeholders = await findSelectionStakeholderIds(id);

        await removeSelection(id);

        createActivity({
            targetUsers: [session.user.id],
            event: "selection.deleted_by_self",
            entityId: existingSelection.id,
            metadata: { title: existingSelection.title },
            actorId: session.user.id,
        });

        // Notify everyone else with access that the shared selection was deleted.
        const others = stakeholders.filter((uid) => uid !== session.user.id);
        if (others.length > 0) {
            createActivity({
                targetUsers: others,
                event: "selection.deleted_by_other",
                entityId: existingSelection.id,
                metadata: { title: existingSelection.title, actorName: session.user.name || session.user.email || "Someone" },
                actorId: session.user.id,
            });
        }

        revalidatePath('/liturgical-selections');
        revalidatePath('/dashboard');

        return { message: "Mass selection deleted successfully" };
    } catch (error: any) {
        console.error("Error deleting mass selection:", error);
        throw new Error("Error deleting mass selection: " + error?.message);
    }
}

// Clone selection
export async function cloneSelection(selectionId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            redirect("/signin");
        }

        const originalSelection = await findSelection(selectionId);
        if (!originalSelection) {
            throw new Error("Mass selection not found");
        }

        // Anyone with any access (owner, collaborator, or a public selection) can clone.
        const access = await getSelectionAccess(selectionId, session.user.id);
        if (!can(access, Permission.View)) {
            throw new Error("Access denied");
        }

        const parishAndChoirInfo = await findUserParishAndChoirInfo(session.user.id);
        const { parishLocationId, themes, choirName, parishName, title, id, createdAt, updatedAt, createdById, isPublic, ...selection } = originalSelection;

        const result = await createDraft({
            ...selection,
            title: `${title} (Copy)`,
            isPublic: true,
            themes: themes.map(theme => theme.name),
            parishLocation: parishAndChoirInfo?.parishLocation || null,
            choirName: parishAndChoirInfo?.choirName || null,
            parishName: parishAndChoirInfo?.parishName || null,
        }, session.user.id);

        // Create activities for both self and original creator (if different)
        if (session.user.id === originalSelection.createdById)
            createActivity({
                targetUsers: [session.user.id],
                event: "selection.cloned_by_self",
                entityId: originalSelection.id,
                metadata: { title: originalSelection.title },
                actorId: session.user.id,
            });

        else {
            createActivity({
                targetUsers: [session.user.id],
                event: "selection.cloned_by_self",
                entityId: originalSelection.id,
                metadata: { title: originalSelection.title },
                actorId: session.user.id,
            });

            createActivity({
                targetUsers: [originalSelection.createdById],
                event: "selection.cloned_by_other",
                entityId: originalSelection.id,
                metadata: { title: originalSelection.title, actorName: session.user.name || session.user.email || "Unknown User" },
                actorId: session.user.id,
            });
        }

        revalidatePath('/liturgical-selections/new');
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/drafts');

        return result;

    } catch (error: any) {

        // Handle redirect errors properly
        if (isRedirectError(error)) {
            // Rethrow so Next.js handles the redirect natively
            throw error;
        }

        console.error("Error cloning mass selection:", error);
        throw new Error("Error cloning mass selection: " + error?.message);
    }
}

export async function getThemes() {
    const themes = await findAllThemes()

    return themes.map(theme => theme.name)
}

export async function getMassSelectionStats() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return findMassSelectionStats(session.user.id)
}

export async function getAllPartNames() {
    const parts = await findAllPartNames();

    return parts.map(part => part.partName);
}