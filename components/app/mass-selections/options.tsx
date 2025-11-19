"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import CloneButton from "./clone-button";
import DeleteButton from "./delete-button";
import DownloadButton from "./download-button";
import Link from "next/link";
import { SingleMassSelection } from "@/types/models";
import { useSession } from "next-auth/react";

export default function Options({
  selection,
}: {
  selection: SingleMassSelection;
}) {
  const { data: session } = useSession();
  const isOwner = selection.createdById === session?.user?.id;

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
        {isOwner && (
          <DropdownMenuItem title="Make changes to this selection" asChild>
            <Link href={`/liturgical-selections/${selection.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
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
        {isOwner && (
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
