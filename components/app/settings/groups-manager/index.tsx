"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { createGroup } from "@/lib/actions/collaborator-groups";
import {
  createGroupSchema,
  type CreateGroupInput,
  type ShareableRole,
} from "@/types/schemas/collaboration";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { withToast } from "@/lib/with-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import GroupCard from "./group-card";
import { PendingInvite, UserLite } from "@/types/models";

type Member = UserLite & { role: ShareableRole };
export type GroupView = {
  id: string;
  name: string;
  ownerId: string;
  owner: UserLite;
  isOwner: boolean;
  canManageMembers: boolean;
  viewerId: string;
  members: Member[];
  invitations: PendingInvite[];
  attachedCount: number;
};

export default function GroupsManager({
  initialGroups,
}: Readonly<{ initialGroups: GroupView[] }>) {
  const router = useRouter();

  const form = useForm<CreateGroupInput>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (values: CreateGroupInput) => {
    const { data } = await withToast(() => createGroup(values), {
      loading: "Creating group…",
      success: "Group created.",
    });
    if (data) {
      form.reset({ name: "" });
      router.refresh();
    }
  };

  const pending = form.formState.isSubmitting;

  return (
    <div className="flex flex-col w-full gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New group</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 w-full">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-start gap-2 w-full"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. St. Cecilia choir music committee"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={pending} className="w-fit">
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </form>
          </Form>
          <p className="text-muted-foreground mt-2 text-xs">
            Reuse a group across selections and drafts. Updating its members
            updates access everywhere the group is used.
          </p>
        </CardContent>
      </Card>

      {initialGroups.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          You don’t have any groups yet. Create one above.
        </p>
      ) : (
        initialGroups.map((group) => <GroupCard key={group.id} group={group} />)
      )}
    </div>
  );
}
