import BackButton from "@/components/common/back-button";
import GroupsManager from "@/components/app/settings/groups-manager";
import { getMyGroups } from "@/lib/actions/collaborator-groups";
import { requireAuth } from "@/lib/auth";

export default async function GroupsSettingsPage() {
  await requireAuth(`/settings/groups`);

  const groups = await getMyGroups();

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <BackButton fallback="/" />
          <div>
            <h2 className="font-display text-foreground text-3xl">
              Collaborator Groups
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Save reusable groups of people and attach them to selections and
              drafts instead of adding everyone one by one.
            </p>
          </div>
        </div>

        <GroupsManager initialGroups={groups} />
      </div>
    </div>
  );
}
