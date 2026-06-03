'use server'

import { AppUser, UserProfile } from "@/types/models";
import { DraftSelectionFilter, MassSelectionFilter, NotificationChannel, SortBy, SortOrder, SortUsersBy, UsersFilter } from "@/types/utils";
import { countAnnouncementStats, createAnnouncement, findAllAnnouncements } from "@/db/announcement";
import findAllDrafts, { deleteAllOldDrafts, deleteDraftById, findAdminDashboardStats, findAllAdminUserIds, findAllUserIds, findAllUsersForSelect, findDraftsExpiringSoon, findDraftsStats, findSelectionsStats, findUsersStats, updateUserAdminStatus } from "@/db/admin";
import { findAllUserSelections, findMassSelectionStats } from "@/db/mass-selections";
import findAllUsers, { findUser, findUserProfile } from "@/db/user";

import { auth } from "@/auth";
import { createActivity } from "./activity";
import { findAllActivities } from "@/db/activity";
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

export async function getDraftsStats() {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const user = await findUser(session.user.id);
    if (!isAdmin(user?.userRole)) {
        throw new Error("Forbidden");
    }

    return findDraftsStats()
}

export async function getAllDrafts({ page = 1,
    limit = 12,
    query = '', sortBy, sortOrder }: DraftSelectionFilter) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const user = await findUser(session.user.id);
    if (!isAdmin(user?.userRole)) {
        throw new Error("Forbidden");
    }

    const { drafts, total } = await findAllDrafts({ page, limit, query, sortBy, sortOrder });
    return {
        drafts: drafts,
        pagination: {
            page,
            limit,
            total: total,
            pages: Math.ceil(total / limit),
        },
    };
}

export async function deleteDraft(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const user = await findUser(session.user.id);
        if (!isAdmin(user?.userRole)) {
            throw new Error("Forbidden");
        }

        const deletedDraft = await deleteDraftById(id);

        createActivity({
            targetUsers: [deletedDraft.createdById],
            event: "draft.deleted_by_other",
            entityId: deletedDraft.id,
            metadata: {
                title: deletedDraft.title || "Untitled Draft",
                actorName: user?.name || user?.email || "Unknown User",
                expired: true
            },
        });

        revalidatePath('/admin');
        revalidatePath('/admin/drafts');

    } catch (error: any) {
        console.error("Error deleting draft:", error);
        throw new Error("Error deleting draft: " + error?.message);
    }
}

export async function notifyDraftsExpiringSoon() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const user = await findUser(session.user.id);
        if (!isAdmin(user?.userRole)) {
            throw new Error("Forbidden");
        }

        const expiringDrafts = await findDraftsExpiringSoon();

        expiringDrafts.forEach(expiringDraft => {
            createActivity({
                targetUsers: [expiringDraft.createdById],
                event: "draft.expiring",
                entityId: expiringDraft.id,
                metadata: {
                    title: expiringDraft.title || "Untitled Draft",
                },
            });
        });

    } catch (error: any) {
        console.error("Error notifying about expiring drafts:", error);
    }
}

export async function deleteOldDrafts() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const user = await findUser(session.user.id);
        if (!isAdmin(user?.userRole)) {
            throw new Error("Forbidden");
        }

        const deletedDrafts = await deleteAllOldDrafts();

        deletedDrafts.forEach(deletedDraft => {
            createActivity({
                targetUsers: [deletedDraft.createdById],
                event: "draft.deleted_by_other",
                entityId: deletedDraft.id,
                metadata: {
                    title: deletedDraft.title || "Untitled Draft",
                    actorName: user?.name || user?.email || "Unknown User",
                    expired: true
                },
            });
        });

        revalidatePath('/admin');
        revalidatePath('/admin/drafts');

    } catch (error: any) {
        console.error("Error deleting drafts:", error);
        throw new Error("Error deleting drafts: " + error?.message);
    }
}

export async function getAllActivities({
    page = 1,
    limit = 20,
    actorId,
    entityType,
    event,
}: {
    page?: number;
    limit?: number;
    actorId?: string;
    entityType?: string;
    event?: string;
} = {}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const user = await findUser(session.user.id);
        if (!isAdmin(user?.userRole)) {
            throw new Error("Forbidden");
        }

        const { activities, total } = await findAllActivities({ page, limit, actorId, entityType, event });

        return {
            activities,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error: any) {
        console.error("Error fetching activities:", error);
        throw new Error("Error fetching activities: " + error?.message);
    }
}

export async function getAllUsersForSelect() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const user = await findUser(session.user.id);
    if (!isAdmin(user?.userRole)) throw new Error("Forbidden");

    return findAllUsersForSelect();
}

export async function createAnnouncementAction({
    title,
    message,
    type,
    targetUsers,
    selectedUserIds,
    inApp,
    email,
    push,
}: {
    title: string;
    message: string;
    type: string;
    targetUsers: "all" | "admins" | "specific";
    selectedUserIds?: string[];
    inApp: boolean;
    email: boolean;
    push: boolean;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const user = await findUser(session.user.id);
        if (!isAdmin(user?.userRole)) throw new Error("Forbidden");

        // Resolve target user IDs
        let recipientIds: string[];
        if (targetUsers === "all") {
            recipientIds = await findAllUserIds();
        } else if (targetUsers === "admins") {
            recipientIds = await findAllAdminUserIds();
        } else {
            if (!selectedUserIds?.length) throw new Error("No users selected");
            recipientIds = selectedUserIds;
        }

        // Create the announcement record
        const announcement = await createAnnouncement({
            title,
            message,
            type,
            targetUsers,
            inApp,
            email,
            push,
            recipientCount: recipientIds.length,
            createdBy: { connect: { id: session.user.id } },
        });

        // Build channels array from boolean flags
        const channels: NotificationChannel[] = [];
        if (inApp) channels.push(NotificationChannel.IN_APP);
        if (email) channels.push(NotificationChannel.EMAIL);
        if (push) channels.push(NotificationChannel.PUSH);

        // Dispatch activity + notifications
        createActivity({
            targetUsers: recipientIds,
            event: "system.announcement",
            entityId: announcement.id,
            metadata: { title, message },
            channels,
        });

        revalidatePath("/admin/notifications");
        return announcement;
    } catch (error: any) {
        console.error("Error creating announcement:", error);
        throw new Error("Error creating announcement: " + error?.message);
    }
}

export async function getAnnouncementsAction({
    page = 1,
    type,
}: { page?: number; type?: string } = {}) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const user = await findUser(session.user.id);
        if (!isAdmin(user?.userRole)) throw new Error("Forbidden");

        const { announcements, total } = await findAllAnnouncements({ page, type });

        return {
            announcements,
            pagination: {
                page,
                limit: 20,
                total,
                pages: Math.ceil(total / 20),
            },
        };
    } catch (error: any) {
        console.error("Error fetching announcements:", error);
        throw new Error("Error fetching announcements: " + error?.message);
    }
}

export async function getAnnouncementsStatsAction() {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const user = await findUser(session.user.id);
        if (!isAdmin(user?.userRole)) throw new Error("Forbidden");

        return countAnnouncementStats();
    } catch (error: any) {
        console.error("Error fetching announcement stats:", error);
        throw new Error("Error fetching announcement stats: " + error?.message);
    }
}