import BackButton from "@/components/common/back-button";
import ProfileForm from "@/components/app/settings/profile-form";
import { getUserProfile } from "@/lib/actions/user";
import { requireAuth } from "@/lib/auth";

export default async function EditProfilePage() {
  await requireAuth(`/settings/profile`);

  const user = await getUserProfile();

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <BackButton fallback="/profile" />
          <div>
            <h2 className="text-3xl font-display text-foreground">
              Edit Profile
            </h2>
          </div>
        </div>

        <ProfileForm user={user} />
      </div>
    </div>
  );
}
