import { NotificationBellClient } from "./notification-bell-client";
import { getMyUnreadNotificationsCount } from "@/lib/actions/notification";

export async function NotificationBell() {
    const initialCount = await getMyUnreadNotificationsCount();
    return <NotificationBellClient initialCount={initialCount} />;
}
