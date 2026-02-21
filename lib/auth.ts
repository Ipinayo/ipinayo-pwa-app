import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAuth(callbackPath?: string) {
    const session = await auth();
    if (!session) {
        const callbackUrl = callbackPath ? `?callbackUrl=${encodeURIComponent(callbackPath)}` : "";
        redirect(`/signin${callbackUrl}`);
    }
    return session;
}