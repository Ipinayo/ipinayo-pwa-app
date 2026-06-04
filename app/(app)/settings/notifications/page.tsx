import BackButton from "@/components/common/back-button";
import { NotificationPreferencesForm } from "@/components/app/settings/notification-preferences-form";
import { getMyNotificationPreferencesAction } from "@/lib/actions/notification-preference";
import { requireAuth } from "@/lib/auth";

export default async function NotificationSettingsPage() {
  await requireAuth(`/settings/notifications`);

  const preferences = await getMyNotificationPreferencesAction();

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <BackButton fallback="/" />
          <div>
            <h2 className="text-3xl font-display text-foreground">
              Notification Settings
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose how you want to be notified for each type of activity.
            </p>
          </div>
        </div>

        <NotificationPreferencesForm preferences={preferences} />
      </div>
    </div>
  );
}
