"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  createGroupSchema,
  type CreateGroupInput,
} from "@/types/schemas/collaboration";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { renameGroup } from "@/lib/actions/collaborator-groups";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { withToast } from "@/lib/with-toast";
import { zodResolver } from "@hookform/resolvers/zod";

/** Inline rename field that owns the rename action and zod validation. */
export function GroupRenameForm({
  groupId,
  currentName,
  onClose,
}: Readonly<{
  groupId: string;
  currentName: string;
  onClose: () => void;
}>) {
  const router = useRouter();
  const form = useForm<CreateGroupInput>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { name: currentName },
  });

  const onSubmit = async ({ name }: CreateGroupInput) => {
    if (name.trim() === currentName) {
      onClose();
      return;
    }
    const { error } = await withToast(
      () => renameGroup({ groupId, name }),
      { success: "Group renamed." },
    );
    if (!error) {
      onClose();
      router.refresh();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 items-start gap-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input {...field} maxLength={80} autoFocus className="h-8" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="icon"
          className="size-8"
          disabled={form.formState.isSubmitting}
          aria-label="Save name"
        >
          <Check className="size-4" />
        </Button>
      </form>
    </Form>
  );
}
