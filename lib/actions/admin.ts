import { auth } from "@/auth";
import { findAdminDashboardStats } from "@/db/admin";
import { findUser } from "@/db/user";
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