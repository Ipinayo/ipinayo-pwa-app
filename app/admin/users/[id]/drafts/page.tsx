import { Params, SearchParams } from "@/types/utils";

import BackButton from "@/components/common/back-button";
import DraftSelectionListSkeleton from "@/components/app/admin/drafts/draft-selections-list/index-skeleton";
import DraftSelectionsList from "@/components/app/admin/drafts/draft-selections-list";
import SearchBar from "@/components/common/search-bar";
import { Suspense } from "react";

export default async function UserDraftsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  const userId = params.id;

  const filters = await props.searchParams;

  const page = Number(filters["page"]) || 1;
  const query = filters["query"] || "";

  const searchKey = [page, query].join("-");

  return (
    <div className="max-w-full w-full">
      <BackButton to={`/admin/users/${userId}`} backText="Back to User Page" />
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-display text-foreground">User Drafts</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchBar query={query} placeholder="Search user drafts..." />
      </div>

      <Suspense fallback={<DraftSelectionListSkeleton />} key={searchKey}>
        <DraftSelectionsList
          userId={userId}
          query={query}
          page={page}
          saveFilter={false}
        />
      </Suspense>
    </div>
  );
}
