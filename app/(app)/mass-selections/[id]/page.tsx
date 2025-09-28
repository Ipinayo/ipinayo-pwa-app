import { ViewMassSelection } from "@/components/view-mass-selection";

export default async function ViewPage({ params }: { params: { id: string } }) {
  return <ViewMassSelection id={params.id} />;
}
