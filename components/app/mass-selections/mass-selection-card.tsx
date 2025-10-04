"use client";

import {
  Calendar,
  Copy,
  Download,
  Edit,
  Eye,
  Globe,
  Lock,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateLocale, getLabelForValue } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MassSelection } from "@/types/models";
import { liturgicalSeasonItems } from "@/lib/constants";

export default function MassSelectionCard({
  selection,
  isOwner = false,
  publicView = true,
}: {
  selection: MassSelection;
  isOwner: boolean;
  publicView?: boolean;
}) {
  const handleClone = async (id: string) => {
    try {
      const response = await fetch(`/api/mass-selections/${id}/clone`, {
        method: "POST",
      });
      if (response.ok) {
        // fetchSelections(); // Refresh the list
      }
    } catch (error) {
      console.error("Error cloning selection:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mass selection?"))
      return;

    try {
      const response = await fetch(`/api/mass-selections/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        // fetchSelections(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting selection:", error);
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="flex items-center justify-between">
              <span className="line-clamp-2">{selection.title}</span>
              {selection.liturgicalYear && (
                <Badge variant="outline" className="ml-2 shrink-0">
                  Year {selection.liturgicalYear}
                </Badge>
              )}
            </CardTitle>
          </div>
          {!publicView && (
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/mass-selections/${selection.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  {isOwner && (
                    <DropdownMenuItem asChild>
                      <Link href={`/edit/${selection.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleClone(selection.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Clone
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(
                        `/api/mass-selections/${selection.id}/pdf`,
                        "_blank"
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </DropdownMenuItem>
                  {isOwner && (
                    <DropdownMenuItem
                      onClick={() => handleDelete(selection.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          {new Date(selection.date).toLocaleDateString()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex h-full flex-col">
        <div className="space-y-2">
          {!publicView && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Visibility:</span>
              {selection.isPublic ? (
                <Badge variant="secondary" className="text-xs">
                  <Globe className="mr-1 h-3 w-3" />
                  Public
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  <Lock className="mr-1 h-3 w-3" />
                  Private
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Parts:</span>
            <span className="font-medium">{selection._count.parts}</span>
          </div>

          {selection.liturgicalSeason && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Season:</span>
              <span className="font-medium">
                {getLabelForValue(
                  liturgicalSeasonItems,
                  selection.liturgicalSeason
                )}
              </span>
            </div>
          )}

          {selection.themes.length > 0 && (
            <div className="flex items-center justify-between text-sm gap-5">
              <span className="text-muted-foreground">Themes:</span>
              <p className="mt-1 capitalize line-clamp-2 text-xs text-right font-medium">
                {selection.themes.map((theme) => theme.name).join(", ")}
              </p>
            </div>
          )}
        </div>

        {publicView && (
          <div className="flex gap-2 pt-2 mt-auto">
            <Link
              href={`/mass-selections/${selection.id}/pdf`}
              target="_blank"
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 bg-transparent"
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </Link>

            <Link href={`/mass-selections/${selection.id}`} className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 bg-transparent"
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
            </Link>

            <Link
              href={`/mass-selections/${selection.id}/clone`}
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 bg-transparent"
              >
                <Copy className="h-4 w-4" />
                Clone
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
      {publicView && (
        <CardFooter className="border-t">
          <div className="flex items-center w-full justify-between text-xs text-muted-foreground">
            <span>
              by {selection.createdBy.name || selection.createdBy.email}
            </span>
            <span>
              Updated {formatDateLocale(selection.updatedAt.toString())}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
