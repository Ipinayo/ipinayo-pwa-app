import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BookOpen } from "lucide-react";
import DraftListSkeleton from "@/components/app/admin/user/draft-list/index-skeleton";
import SelectionsListSkeleton from "@/components/app/admin/user/selections-list/index-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import UserDetailsSkeleton from "@/components/app/admin/user/user-details.tsx/index-skeleton";
import UserRoleDisplaySkeleton from "@/components/app/admin/user/user-role-display/index-skeleton";

export default function UserLoading() {
  return (
    <div className="max-w-full w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <UserRoleDisplaySkeleton />
      </div>

      <UserDetailsSkeleton />

      <Tabs defaultValue="selections" className="w-full space-y-6 mb-8">
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
          <SelectionsListSkeleton />
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <DraftListSkeleton />
        </TabsContent>
      </Tabs>
    </div>
  );
}
