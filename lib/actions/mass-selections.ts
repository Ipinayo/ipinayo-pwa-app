'use server'

import { MassSelectionFilter, SortBy, SortOrder } from "@/types/utils";
import { createMassSelectionSchema, updateMassSelectionSchema } from "@/types/schemas/mass-selections";
import {
    findAllPartNames,
    findAllSelections,
    findAllThemes,
    findAllUserSelections,
    findMassSelectionStats,
    findSelection,
    findSelectionWithParts,
    findUserSelection,
    removeSelection,
    saveSelection,
    updateSelection as updateSelectionDb
} from "@/db/mass-selections";

import { NewMassSelection } from "@/types/models";
import { auth } from "@/auth";
import { createDraft } from "@/db/draft";
import { findUserParishAndChoirInfo } from "@/db/user";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import z from "zod";

function parseFormData(formData: FormData): Record<string, any> {
    const object: Record<string, any> = {};
    formData.forEach((value, key) => {
        // Handle nested paths using dot notation (e.g., "parts.0.songTitle")
        const path = key.split('.');
        let current = object;

        for (let i = 0; i < path.length; i++) {
            const segment = path[i];

            if (i === path.length - 1) {
                // Handle special cases
                if (key === 'isPublic') {
                    current[segment] = value === 'true';
                } else if (key === 'date') {
                    current[segment] = new Date(value.toString());
                } else if (key === 'themes') {
                    current[segment] = value.toString().split(',').filter(Boolean);
                } else if (['liturgicalYear', 'liturgicalSeason', 'keySignature'].includes(segment)) {
                    current[segment] = value || null;
                } else {
                    current[segment] = value || null;
                }
            } else {
                if (segment === 'parts') {
                    if (!current[segment]) current[segment] = [];
                    const index = parseInt(path[i + 1]);
                    if (!current[segment][index]) current[segment][index] = {};
                    current = current[segment][index];
                    i++; // Skip the index
                } else {
                    current[segment] = current[segment] || {};
                    current = current[segment];
                }
            }
        }
    });
    return object;
}

type ValidationError = {
    [K in keyof z.infer<typeof createMassSelectionSchema>]?: string[];
} & {
    _form?: string[];
};

// Get all selections (public)
export async function getSelections({
    page = 1,
    limit = 12,
    query = '',
    season,
    year,
    sortBy = SortBy.DATE,
    sortOrder = SortOrder.DESC
}: MassSelectionFilter) {
    try {
        const { selections, total } = await findAllSelections({
            page,
            limit,
            query,
            season,
            sortBy,
            sortOrder,
            year
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
    sortOrder = SortOrder.DESC
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
            year
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

        // Validate data
        const validationResult = createMassSelectionSchema.safeParse(data);
        if (!validationResult.success) {
            throw new Error(validationResult.error.message);
        }

        const result = await saveSelection(validationResult.data, session.user.id, draftId);

        revalidatePath('/liturgical-selections');
        revalidatePath('/liturgical-selections/new');
        revalidatePath('/dashboard');

        return result;

    } catch (error: any) {
        console.error("Error creating mass selection:", error);
        throw new Error("Error creating mass selection: " + error?.message);
    }
}

// Create new selection with FormData
export async function createSelectionFromForm(formData: FormData, draftId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const data = parseFormData(formData);
        const validationResult = createMassSelectionSchema.safeParse(data);

        if (!validationResult.success) {
            const errors: ValidationError = {};
            validationResult.error.issues.forEach((error) => {
                const path = error.path.join('.');
                if (!errors[path as keyof ValidationError]) {
                    errors[path as keyof ValidationError] = [];
                }
                errors[path as keyof ValidationError]?.push(error.message);
            });
            return { success: false, errors };
        }

        const result = await saveSelection(validationResult.data, session.user.id, draftId);

        revalidatePath('/liturgical-selections');
        revalidatePath('/liturgical-selections/new');
        revalidatePath('/dashboard');

        return { success: true, data: result };
    } catch (error: any) {
        console.error("Error creating mass selection:", error);
        return {
            success: false,
            errors: { _form: ["Failed to create mass selection"] }
        };
    }
}

// Update selection with validation
export async function updateSelection(id: string, data: Partial<NewMassSelection>) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Check ownership
        const existingSelection = await findUserSelection(id, session.user.id);
        if (!existingSelection) {
            throw new Error("Mass selection not found");
        }

        // Validate partial data
        const validationResult = updateMassSelectionSchema.safeParse(data);
        if (!validationResult.success) {
            throw new Error(validationResult.error.message);
        }

        const result = await updateSelectionDb(validationResult.data, id);

        revalidatePath('/liturgical-selections');
        revalidatePath(`/liturgical-selections/${id}`);
        revalidatePath('/dashboard');

        return result;
    } catch (error: any) {
        console.error("Error updating mass selection:", error);
        throw new Error("Error updating mass selection: " + error?.message);
    }
}

// Update selection with FormData
export async function updateSelectionFromForm(id: string, formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Check ownership
        const existingSelection = await findUserSelection(id, session.user.id);
        if (!existingSelection) {
            return {
                success: false,
                errors: { _form: ["Mass selection not found"] }
            };
        }

        const data = parseFormData(formData);
        const validationResult = updateMassSelectionSchema.safeParse(data);

        if (!validationResult.success) {
            const errors: ValidationError = {};
            validationResult.error.issues.forEach((error) => {
                const path = error.path.join('.');
                if (!errors[path as keyof ValidationError]) {
                    errors[path as keyof ValidationError] = [];
                }
                errors[path as keyof ValidationError]?.push(error.message);
            });
            return { success: false, errors };
        }

        const result = await updateSelectionDb(validationResult.data, id);

        revalidatePath('/liturgical-selections');
        revalidatePath(`/liturgical-selections/${id}`);
        revalidatePath('/dashboard');

        return { success: true, data: result };
    } catch (error: any) {
        console.error("Error updating mass selection:", error);
        return {
            success: false,
            errors: { _form: ["Failed to update mass selection"] }
        };
    }
}

// Delete selection
export async function deleteSelection(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Check ownership
        const existingSelection = await findUserSelection(id, session.user.id);
        if (!existingSelection) {
            throw new Error("Mass selection not found");
        }

        await removeSelection(id);

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

        // Check access: owner or public selection
        if (originalSelection.createdById !== session.user.id && !originalSelection.isPublic) {
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