import BackButton from "@/components/common/back-button";
import { Button } from "@/components/ui/button";
import DraftSelectionListSkeleton from "@/components/app/draft-selections/draft-selections-list/index-skeleton";
import DraftSelectionsList from "@/components/app/draft-selections/draft-selections-list";
import Link from "next/link";
import { Plus } from "lucide-react";
import SearchBar from "@/components/common/search-bar";
import { SearchParams } from "@/types/utils";
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth";

export default async function DraftsPage(props: {
  searchParams: SearchParams;
}) {
  const filters = await props.searchParams;

  const searchParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
    ) as Record<string, string>
  );

  const callbackUrl =
    "/dashboard/drafts" +
    (searchParams.toString() ? `?${searchParams.toString()}` : "");

  await requireAuth(callbackUrl);
  const page = Number(filters["page"]) || 1;
  const query = filters["query"] || "";

  const searchKey = [page, query].join("-");

  return (
    <div className="max-w-full w-full">
      <BackButton to="/dashboard" backText="Back to dashboard" />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display text-foreground">My Drafts</h2>
        </div>
        <Link href="/liturgical-selections/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Selection
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchBar query={query} placeholder="Search my drafts..." />
      </div>

      <Suspense fallback={<DraftSelectionListSkeleton />} key={searchKey}>
        <DraftSelectionsList query={query} page={page} />
      </Suspense>
    </div>
  );
}
