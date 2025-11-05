'use server'

import { AppUser, UserProfile } from "@/types/models";
import { findUser, findUserParishAndChoirInfo, findUserProfile, updateUserProfile } from "@/db/user";

import { UpdateUserProfile } from "@/types/utils";
import { auth } from "@/auth";
import { updateUserProfileSchema } from "@/types/schemas/user";

export async function getUserProfile(): Promise<UserProfile> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return findUserProfile(session.user.id);
}

export async function updateUserProfileAction(updates: UpdateUserProfile) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Validate data
    const validationResult = updateUserProfileSchema.safeParse(updates);
    if (!validationResult.success) {
        throw new Error(validationResult.error.message);
    }

    return updateUserProfile(session.user.id, updates);
}

export async function getUser(): Promise<AppUser | null> {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    return findUser(session.user.id);
}

export async function getUserParishAndChoirInfo() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return await findUserParishAndChoirInfo(session.user.id);
}