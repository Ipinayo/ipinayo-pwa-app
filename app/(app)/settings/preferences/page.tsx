import BackButton from "@/components/common/back-button";
import { PreferencesForm } from "@/components/app/settings/preferences-form";
import { requireAuth } from "@/lib/auth";

export default async function EditPreferences() {
  await requireAuth(`/settings/preferences`);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <BackButton fallback="/" />
          <div>
            <h2 className="text-3xl font-display text-foreground">
              Edit Preferences
            </h2>
          </div>
        </div>

        <PreferencesForm />
      </div>
    </div>
  );
}
