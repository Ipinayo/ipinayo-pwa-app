import { EditMassSelection } from "@/components/edit-mass-selection";

export default function EditPage({ params }: { params: { id: string } }) {
  return <EditMassSelection id={params.id} />;
}
