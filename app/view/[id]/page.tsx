import { ViewMassSelection } from "@/components/view-mass-selection";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ViewPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return <ViewMassSelection id={params.id} />;
}
