import { CreateMassSelection } from "@/components/create-mass-selection";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CreatePage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return <CreateMassSelection />;
}
