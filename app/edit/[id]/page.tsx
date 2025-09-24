import { EditMassSelection } from "@/components/edit-mass-selection";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function EditPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return <EditMassSelection id={params.id} />;
}
