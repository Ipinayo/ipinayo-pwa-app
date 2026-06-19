"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreVertical, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import CloneButton from "./clone-button";
import DeleteButton from "./delete-button";
import DownloadButton from "./download-button";
import Link from "next/link";
import { SingleMassSelection } from "@/types/models";
import { useSession } from "next-auth/react";

export default function Options({
  selection,
  access,
}: {
  selection: SingleMassSelection;
  access?: { canEdit: boolean; canManage: boolean };
}) {
  const { data: session } = useSession();

  const isOwner = selection.createdById === session?.user?.id;
  const canEdit = access?.canEdit ?? isOwner;
  const canManage = access?.canManage ?? isOwner;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/liturgical-selections/${selection.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem title="Make changes to this selection" asChild>
            <Link href={`/liturgical-selections/${selection.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
        )}
        {canManage && (
          <DropdownMenuItem title="Add and manage collaborators" asChild>
            <Link href={`/liturgical-selections/${selection.id}/collaborators`}>
              <Users className="mr-2 h-4 w-4" />
              Collaborators
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <CloneButton
            variant="ghost"
            className="w-full h-fit inline-flex justify-start items-start [&:has(>svg)]:px-2 "
            selectionId={selection.id}
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <DownloadButton
            variant="ghost"
            className="w-full h-fit inline-flex justify-start items-start [&:has(>svg)]:px-2 "
            selectionId={selection.id}
          />
        </DropdownMenuItem>
        {canManage && (
          <DropdownMenuItem asChild>
            <DeleteButton
              variant="ghost"
              className="w-full h-fit flex justify-start items-start [&:has(>svg)]:px-2 text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 hover:text-destructive "
              selectionId={selection.id}
            />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
