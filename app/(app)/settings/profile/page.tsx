import BackButton from "@/components/common/back-button";
import ProfileForm from "@/components/app/settings/profile-form";
import { auth } from "@/auth";
import { getUserProfile } from "@/lib/actions/user";
import { redirect } from "next/navigation";

export default async function EditProfilePage() {
  const session = await auth();

  if (!session?.user) redirect("/signin");

  const user = await getUserProfile();

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
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
