import {
  Calendar,
  Clock,
  Eye,
  Globe,
  Lock,
  MapPin,
  User,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, formatParishInfo, getLabelForValue } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CloneButton from "@/components/app/mass-selections/clone-button";
import DownloadButton from "@/components/app/mass-selections/download-button";
import Link from "next/link";
import { MassSelection } from "@/types/models";
import Options from "./options";
import { liturgicalSeasonItems } from "@/lib/constants";

export default function MassSelectionCard({
  selection,
  publicView = true,
}: {
  selection: MassSelection;
  publicView?: boolean;
}) {
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
              <Options selection={selection} />
            </div>
          )}
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          {formatDate(selection.date)}
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
            <DownloadButton
              variant="outline"
              size="sm"
              className="w-full gap-2 bg-transparent flex-1"
              selectionId={selection.id}
            />

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 bg-transparent flex-1"
              asChild
            >
              <Link href={`/liturgical-selections/${selection.id}`}>
                <Eye className="h-4 w-4" />
                View
              </Link>
            </Button>

            <CloneButton
              variant="outline"
              size="sm"
              className="w-full gap-2 bg-transparent flex-1"
              selectionId={selection.id}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-border/50 flex flex-col gap-1">
        {publicView && (
          <div className="grid grid-cols-2 gap-4 text-xs w-full">
            <div className="flex items-start gap-2 min-w-0">
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">Created by</p>
                <p className="font-medium text-foreground truncate">
                  {selection.createdBy.name || selection.createdBy.email}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 min-w-0">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">Last Updated</p>
                <p className="font-medium text-foreground text-xs">
                  {formatDate(selection.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-2 min-w-0">
            <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">For</p>
              <p className="font-medium text-foreground truncate">
                {selection.choirName || "Unnamed Choir"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 min-w-0">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">
                {selection.parishName && selection.parishLocation
                  ? "Parish: "
                  : "Parish In: "}
              </p>
              <p className="font-medium text-foreground truncate">
                {formatParishInfo(
                  selection.parishLocation,
                  selection.parishName
                )}
              </p>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
