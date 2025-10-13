import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SaveFormSkeleton } from "@/components/app/mass-selections/save-form-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link href={"/mass-selections/new"}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Mass Selection</h1>
            <Skeleton className="h-4 w-28 mt-1" />
          </div>
        </div>

        <SaveFormSkeleton />
      </div>
    </div>
  );
}
