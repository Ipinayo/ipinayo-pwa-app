import { AssistantTrigger } from "@/components/app/assistant/assistant-trigger";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateSelectionTrigger({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <AssistantTrigger />
      <Button size="lg" variant="outline" className="gap-2" asChild>
        <Link href="/liturgical-selections/new">
          <Plus className="h-5 w-5" />
          Create Manually
        </Link>
      </Button>
    </div>
  );
}
