import { Params } from "@/types/utils";
import { ViewMassSelection } from "@/components/view-mass-selection";

export default async function ViewPage(props: { params: Params }) {
  const params = await props.params;
  return <ViewMassSelection id={params.id} />;
}
