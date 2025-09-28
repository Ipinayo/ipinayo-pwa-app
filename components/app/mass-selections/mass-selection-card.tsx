import { Calendar, Download, Edit, Eye, Link } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MassSelection } from "@/types/models";

export default function MassSelectionCard({
  selection,
}: {
  selection: MassSelection;
}) {
  return (
    <Card key={selection.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <span className="line-clamp-2">{selection.title}</span>
          <Badge variant="outline" className="ml-2 shrink-0">
            Year {selection.liturgicalYear}
          </Badge>
        </CardTitle>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          {new Date(selection.date).toLocaleDateString()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Parts:</span>
            <span className="font-medium">{selection._count.parts}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Season:</span>
            <Badge variant="secondary">{selection.liturgicalSeason}</Badge>
          </div>

          {selection.themes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Themes:</span>
              <p className="mt-1 line-clamp-2 text-xs">
                {selection.themes.join(",")}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 bg-transparent"
            // onClick={() => handleDownloadPDF(selection.id, selection.title)}
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>

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
            href={`/mass-selections/${selection.id}/edit`}
            className="flex-1"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 bg-transparent"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
