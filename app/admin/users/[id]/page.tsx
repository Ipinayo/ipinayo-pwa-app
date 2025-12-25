import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import BackButton from "@/components/common/back-button";
import { BookOpen } from "lucide-react";
import DraftList from "@/components/app/admin/user/draft-list";
import DraftListSkeleton from "@/components/app/admin/user/draft-list/index-skeleton";
import { Params } from "@/types/utils";
import SelectionsList from "@/components/app/admin/user/selections-list";
import SelectionsListSkeleton from "@/components/app/admin/user/selections-list/index-skeleton";
import { Suspense } from "react";
import UserDetails from "@/components/app/admin/user/user-details.tsx";
import UserDetailsSkeleton from "@/components/app/admin/user/user-details.tsx/index-skeleton";
import UserRoleDisplay from "@/components/app/admin/user/user-role-display";
import UserRoleDisplaySkeleton from "@/components/app/admin/user/user-role-display/index-skeleton";

export default async function UserPage(props: { params: Params }) {
  const params = await props.params;
  const userId = params.id;

  return (
    <div className="max-w-full w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <BackButton to="/admin/users" backText="Back to Users" />
        <Suspense fallback={<UserRoleDisplaySkeleton />}>
          <UserRoleDisplay userId={userId} />
        </Suspense>
      </div>

      <Suspense fallback={<UserDetailsSkeleton />}>
        <UserDetails userId={userId} />
      </Suspense>

      <Tabs defaultValue="selections" className=" w-full space-y-6 mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="selections" className="gap-2">
            <BookOpen className="h-4 w-4" />
            User Selections
          </TabsTrigger>
          <TabsTrigger value="drafts" className="gap-2">
            <BookOpen className="h-4 w-4 text-amber-500" />
            User Drafts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="selections" className="space-y-4">
          <Suspense fallback={<SelectionsListSkeleton />}>
            <SelectionsList userId={userId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <Suspense fallback={<DraftListSkeleton />}>
            <DraftList userId={userId} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
