import { SortOrder, SortUsersBy, UsersFilter } from "@/types/utils";
import findAllUsers, { findUser } from "@/db/user";

import { auth } from "@/auth";
import { findAdminDashboardStats } from "@/db/admin";
import { isAdmin } from "../utils";

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

    return findAdminDashboardStats()
}

// Get all selections (public)
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