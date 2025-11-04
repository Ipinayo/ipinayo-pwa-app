import BackButton from "@/components/common/back-button";
import { PreferencesPage } from "@/components/app/settings/prefrences-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function EditPreferences() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <BackButton fallback="/" />
          <div>
            <h2 className="text-3xl font-display text-foreground">
              Edit Preferences
            </h2>
          </div>
        </div>

        <PreferencesPage />
      </div>
    </div>
  );
}
