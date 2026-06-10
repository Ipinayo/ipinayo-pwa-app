import BackButton from "@/components/common/back-button";
import CreateSelectionTrigger from "@/components/common/create-selection-trigger";
import DraftSelectionListSkeleton from "@/components/app/draft-selections/draft-selections-list/index-skeleton";
import DraftSelectionsList from "@/components/app/draft-selections/draft-selections-list";
import SearchBar from "@/components/common/search-bar";
import { SearchParams } from "@/types/utils";
import { Suspense } from "react";
import { getCallbackUrl } from "@/lib/utils";
import { requireAuth } from "@/lib/auth";

export default async function DraftsPage(props: {
  searchParams: SearchParams;
}) {
  const filters = await props.searchParams;

  await requireAuth(getCallbackUrl("/dashboard/drafts", filters));
  const page = Number(filters["page"]) || 1;
  const query = filters["query"] || "";

  const searchKey = [page, query].join("-");

  return (
    <div className="max-w-full w-full">
      <BackButton to="/dashboard" backText="Back to dashboard" />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between assistant-open:lg:flex-col assistant-open:xl:flex-row">
        <div>
          <h2 className="text-3xl font-display text-foreground">My Drafts</h2>
        </div>
        <CreateSelectionTrigger />
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
