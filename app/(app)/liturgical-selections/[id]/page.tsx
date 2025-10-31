import { Calendar, Globe, Lock, Music, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatParishInfo, getLabelForValue } from "@/lib/utils";
import { keySignatureItems, liturgicalSeasonItems } from "@/lib/constants";

import BackButton from "@/components/common/back-button";
import { Badge } from "@/components/ui/badge";
import Options from "@/components/app/mass-selections/options";
import { Params } from "@/types/utils";
import { auth } from "@/auth";
import { getSelectionById } from "@/lib/actions/mass-selections";

export default async function ViewPage(props: { params: Params }) {
  const params = await props.params;
  const session = await auth();

  const selection = await getSelectionById(params.id);

  if (!selection.isPublic) {
    if (!session?.user?.id || selection.createdById !== session.user.id) {
      throw new Error("Unauthorized");
    }
  }

  return (
    <div className="mx-auto max-w-6xl w-full">
      <div className="mb-8 flex items-center gap-4">
        <BackButton fallback="/liturgical-selections" />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-display text-foreground">
              {selection.title}
            </h2>
            {selection.isPublic ? (
              <Badge variant="secondary">
                <Globe className="mr-1 h-3 w-3" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline">
                <Lock className="mr-1 h-3 w-3" />
                Private
              </Badge>
            )}
            <Options selection={selection} />
          </div>
          <div className="flex flex-col w-full sm:flex-row items-start sm:items-center gap-1 sm:gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(selection.date)}
            </div>
            <div className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              {selection.parts.length} part(s)
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {selection.createdBy.name || selection.createdBy.email}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 w-full">
        <div className="lg:col-span-2 overflow-x-hidden">
          <Card>
            <CardHeader>
              <CardTitle>Liturgy Parts</CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto">
              <Table className="w-full overflow-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead>Song Title</TableHead>
                    <TableHead className="w-[120px]">Key</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selection.parts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">
                        {part.partName}
                      </TableCell>
                      <TableCell>{part.songTitle}</TableCell>
                      <TableCell>
                        {part.keySignature && (
                          <Badge variant="outline">
                            {getLabelForValue(
                              keySignatureItems,
                              part.keySignature
                            )}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {part.notes || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parish and choir information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm gap-5">
                <label className="text-muted-foreground font-medium">
                  Choir Name
                </label>
                <p className="mt-1 text-sm text-right">
                  {selection.choirName || "Unnamed Choir"}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm gap-5">
                <label className="text-muted-foreground font-medium">
                  {selection.parishName && selection.parishLocation
                    ? "Parish: "
                    : "Parish In: "}
                </label>
                <p className="mt-1 text-sm text-right">
                  {formatParishInfo(
                    selection.parishLocation,
                    selection.parishName
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liturgical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm gap-5">
                <label className="text-muted-foreground font-medium">
                  Liturgical Year
                </label>
                <div className="mt-1 text-right">
                  {selection.liturgicalYear ? (
                    <Badge>Year {selection.liturgicalYear}</Badge>
                  ) : (
                    "-"
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm gap-5">
                <label className="text-muted-foreground font-medium">
                  Season
                </label>
                <div className="mt-1 text-right">
                  {getLabelForValue(
                    liturgicalSeasonItems,
                    selection.liturgicalSeason || ""
                  ) || "-"}
                </div>
              </div>

              <div className="flex items-center gap-5 text-sm justify-between ">
                <label className="text-muted-foreground  font-medium">
                  Themes
                </label>
                <p className="mt-1 capitalize text-right">
                  {selection.themes.map((theme) => theme.name).join(", ") ||
                    "-"}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm gap-5">
                <label className="text-muted-foreground font-medium">
                  Pastoral Focus
                </label>
                <p className="mt-1 text-sm text-right">
                  {selection.pastoralFocus || "-"}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm gap-5">
                <label className="text-muted-foreground font-medium">
                  Liturgy
                </label>
                <p className="mt-1 text-sm text-right">
                  {selection.liturgy || "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm gap-5">
                <label className="text-muted-foreground font-medium">
                  Created
                </label>
                <p className="mt-1 text-sm text-right">
                  {formatDate(selection.createdAt)}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm gap-5">
                <label className="text-muted-foreground font-medium">
                  Last updated
                </label>
                <p className="mt-1 text-sm text-right">
                  {formatDate(selection.updatedAt)}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm gap-5">
                <label className="text-muted-foreground font-medium">
                  Created By
                </label>
                <p className="mt-1 text-sm text-right">
                  {selection.createdBy.name || selection.createdBy.email}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
