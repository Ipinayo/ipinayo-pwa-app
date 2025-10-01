import { EditMassSelection } from "@/components/edit-mass-selection";
import { Params } from "@/types/utils";

export default async function EditPage(props: { params: Params }) {
  const params = await props.params;
  return <EditMassSelection id={params.id} />;
}
