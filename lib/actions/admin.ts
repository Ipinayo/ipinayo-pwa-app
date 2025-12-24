'use server'

import { AppUser, UserProfile } from "@/types/models";
import { DraftSelectionFilter, MassSelectionFilter, SortBy, SortOrder, SortUsersBy, UsersFilter } from "@/types/utils";
import { findAdminDashboardStats, findSelectionsStats, findUsersStats, updateUserAdminStatus } from "@/db/admin";
import { findAllUserSelections, findMassSelectionStats } from "@/db/mass-selections";
import findAllUsers, { findUser, findUserProfile } from "@/db/user";

import { auth } from "@/auth";
import findDraftsByUserId from "@/db/draft";
import { isAdmin } from "../utils";
import { revalidatePath } from "next/cache";

export async function getAdminDashboardStats() {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const user = await findUser(session.user.id);
    if (!isAdmin(user?.userRole)) {
        throw new Error("Forbidden");
    }

    return findAdminDashboardStats()
}

export async function getUsersStats() {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const user = await findUser(session.user.id);
    if (!isAdmin(user?.userRole)) {
        throw new Error("Forbidden");
    }

    return findUsersStats()
}

// Get all users
export async function getAllUsers({
    page = 1,
    limit = 12,
    query = '',
    userRole,
    sortBy = SortUsersBy.CREATED_AT,
    sortOrder = SortOrder.DESC
}: UsersFilter) {

    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const user = await findUser(session.user.id);
    if (!isAdmin(user?.userRole)) {
        throw new Error("Forbidden");
    }

    try {
        const { users, total } = await findAllUsers({
            page,
            limit,
            query,
            userRole,
            sortBy,
            sortOrder,
        });

        return {
            users,
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

export async function getUser(userId: string): Promise<AppUser | null> {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const user = await findUser(session.user.id);
    if (!isAdmin(user?.userRole)) {
        throw new Error("Forbidden");
    }

    return findUser(userId);
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const user = await findUser(session.user.id);
    if (!isAdmin(user?.userRole)) {
        throw new Error("Forbidden");
    }

    return findUserProfile(userId);
}

export async function getUserSelectionStats(userId: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const user = await findUser(session.user.id);
    if (!isAdmin(user?.userRole)) {
        throw new Error("Forbidden");
    }

    return findMassSelectionStats(userId)
}

// Get user selections
export async function getUserSelections(userId: string, {
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

        const user = await findUser(session.user.id);
        if (!isAdmin(user?.userRole)) {
            throw new Error("Forbidden");
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
        }, userId);

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

export async function getUserDrafts(userId: string, { page = 1,
    limit = 12,
    query = '', }: DraftSelectionFilter) {
    try {

        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const user = await findUser(session.user.id);
        if (!isAdmin(user?.userRole)) {
            throw new Error("Forbidden");
        }

        const { drafts, total } = await findDraftsByUserId({ page, limit, query }, userId);
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

export async function updateUserAdminStatusAction(userId: string, makeAdmin: boolean) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const user = await findUser(session.user.id);
    if (!isAdmin(user?.userRole)) {
        throw new Error("Forbidden");
    }

    const result = await updateUserAdminStatus(userId, makeAdmin);

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${result.id}`);

    return result;
}

export async function getSelectionsStats() {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const user = await findUser(session.user.id);
    if (!isAdmin(user?.userRole)) {
        throw new Error("Forbidden");
    }

    return findSelectionsStats()
}