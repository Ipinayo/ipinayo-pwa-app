'use server'

import { AppUser, UserProfile } from "@/types/models";
import { createUserProfile, findUser, findUserParishAndChoirInfo, findUserProfile, updateUserProfile } from "@/db/user";

import { UpdateUserProfile } from "@/types/utils";
import { auth } from "@/auth";
import { createActivity } from "./activity";
import { revalidatePath } from "next/cache";
import { updateUserProfileSchema } from "@/types/schemas/user";

export async function createUserProfileAction(userId: string) {
    const userProfile = await createUserProfile(userId);

    createActivity({
        targetUsers: [userId],
        event: "user.registered",
        entityId: userId,
        metadata: { name: userProfile.user.name || userProfile.user.email },
    })
}

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

    const result = await updateUserProfile(session.user.id, updates);

    createActivity({
        targetUsers: [session.user.id],
        event: "user.updated",
        entityId: session.user.id,
        metadata: {},
    })

    revalidatePath('/profile');
    revalidatePath('/settings/profile');

    return result
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