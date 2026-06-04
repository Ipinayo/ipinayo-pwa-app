import { CreateAnnouncement } from "@/components/app/admin/notifications/create-announcements";
import { getAllUsersForSelect } from "@/lib/actions/admin";

export default async function CreateAnnouncementPage() {
  const users = await getAllUsersForSelect();

  return <CreateAnnouncement users={users} />;
}
