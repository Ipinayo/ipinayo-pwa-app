"use client";

import { Calendar, Download, Edit, Eye, Filter, Music, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface MassSelection {
  id: string;
  title: string;
  date: string;
  partsCount: number;
  liturgicalYear: "A" | "B" | "C";
  liturgicalSeason: string;
  themes?: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 9;

export default function MassSelectionsPage() {
  const [selections, setSelections] = useState<MassSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  useEffect(() => {
    const fetchSelections = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockSelections: MassSelection[] = [
        {
          id: "1",
          title: "Christmas Eve Mass",
          date: "2024-12-24",
          partsCount: 12,
          liturgicalYear: "B",
          liturgicalSeason: "Christmas",
          themes: "Birth of Christ, Joy, Peace",
          createdAt: "2024-12-01",
        },
        {
          id: "2",
          title: "Easter Sunday Celebration",
          date: "2024-03-31",
          partsCount: 14,
          liturgicalYear: "B",
          liturgicalSeason: "Easter",
          themes: "Resurrection, New Life, Hope",
          createdAt: "2024-03-15",
        },
        {
          id: "3",
          title: "Ordinary Time - 15th Sunday",
          date: "2024-07-14",
          partsCount: 8,
          liturgicalYear: "B",
          liturgicalSeason: "Ordinary Time",
          createdAt: "2024-07-01",
        },
        {
          id: "4",
          title: "Wedding of John & Mary",
          date: "2024-06-15",
          partsCount: 10,
          liturgicalYear: "B",
          liturgicalSeason: "Ordinary Time",
          themes: "Love, Unity, Commitment",
          createdAt: "2024-05-20",
        },
        {
          id: "5",
          title: "Advent First Sunday",
          date: "2024-12-01",
          partsCount: 9,
          liturgicalYear: "B",
          liturgicalSeason: "Advent",
          themes: "Waiting, Hope, Preparation",
          createdAt: "2024-11-15",
        },
        {
          id: "6",
          title: "Palm Sunday",
          date: "2024-03-24",
          partsCount: 11,
          liturgicalYear: "B",
          liturgicalSeason: "Lent",
          themes: "Passion, Triumph, Sacrifice",
          createdAt: "2024-03-10",
        },
        {
          id: "7",
          title: "Pentecost Sunday",
          date: "2024-05-19",
          partsCount: 10,
          liturgicalYear: "B",
          liturgicalSeason: "Easter",
          themes: "Holy Spirit, Fire, Gifts",
          createdAt: "2024-05-05",
        },
        {
          id: "8",
          title: "All Saints Day",
          date: "2024-11-01",
          partsCount: 8,
          liturgicalYear: "B",
          liturgicalSeason: "Ordinary Time",
          themes: "Saints, Heaven, Communion",
          createdAt: "2024-10-15",
        },
        {
          id: "9",
          title: "Funeral Mass - Robert Smith",
          date: "2024-08-12",
          partsCount: 7,
          liturgicalYear: "B",
          liturgicalSeason: "Ordinary Time",
          themes: "Eternal Life, Comfort, Hope",
          createdAt: "2024-08-10",
        },
        {
          id: "10",
          title: "Ordination of Deacon Michael",
          date: "2024-09-21",
          partsCount: 13,
          liturgicalYear: "B",
          liturgicalSeason: "Ordinary Time",
          themes: "Service, Calling, Ministry",
          createdAt: "2024-09-01",
        },
      ];

      setSelections(mockSelections);
      setLoading(false);
    };

    fetchSelections();
  }, []);

  const handleDownloadPDF = async (id: string, title: string) => {
    console.log(`Downloading PDF for Mass Selection: ${title}`);

    const link = document.createElement("a");
    link.href = "#";
    link.download = `${title.replace(/\s+/g, "_")}_Mass_Selection.pdf`;
    link.click();
  };

  // Filter selections based on search and filters
  const filteredSelections = selections.filter((selection) => {
    const matchesSearch =
      searchQuery === "" ||
      selection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      selection.themes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeason = seasonFilter === "all" || selection.liturgicalSeason === seasonFilter;

    const matchesYear = yearFilter === "all" || selection.liturgicalYear === yearFilter;

    return matchesSearch && matchesSeason && matchesYear;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSelections.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSelections = filteredSelections.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const seasons = ["Advent", "Christmas", "Ordinary Time", "Lent", "Easter", "Pentecost"];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mass Selections</h1>
            <p className="text-muted-foreground mt-2">Manage your liturgical Mass plans</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="bg-muted h-6 w-3/4 rounded"></div>
                <div className="bg-muted h-4 w-1/2 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-muted h-4 rounded"></div>
                  <div className="bg-muted h-4 w-2/3 rounded"></div>
                  <div className="flex gap-2">
                    <div className="bg-muted h-8 w-20 rounded"></div>
                    <div className="bg-muted h-8 w-20 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mass Selections</h1>
          <p className="text-muted-foreground mt-2">Manage your liturgical Mass plans</p>
        </div>
        <Link href="/mass-selections/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Selection
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search selections..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            <Select
              value={seasonFilter}
              onValueChange={(value) => {
                setSeasonFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Seasons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                {seasons.map((season) => (
                  <SelectItem key={season} value={season}>
                    {season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={yearFilter}
              onValueChange={(value) => {
                setYearFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="A">Year A</SelectItem>
                <SelectItem value="B">Year B</SelectItem>
                <SelectItem value="C">Year C</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4" />
              {filteredSelections.length} of {selections.length} selections
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredSelections.length === 0 ? (
        <Card className="text-center">
          <CardContent>
            <Music className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="mb-2 text-xl font-semibold">
              {searchQuery || seasonFilter !== "all" || yearFilter !== "all"
                ? "No matching selections found"
                : "No Mass Selections Yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || seasonFilter !== "all" || yearFilter !== "all"
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Create your first Mass selection to get started with liturgical planning."}
            </p>
            <Link href="/mass-selections/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Selection
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedSelections.map((selection) => (
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
                      <span className="font-medium">{selection.partsCount}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Season:</span>
                      <Badge variant="secondary">{selection.liturgicalSeason}</Badge>
                    </div>

                    {selection.themes && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Themes:</span>
                        <p className="mt-1 line-clamp-2 text-xs">{selection.themes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 bg-transparent"
                      onClick={() => handleDownloadPDF(selection.id, selection.title)}
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>

                    <Link href={`/mass-selections/${selection.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </Link>

                    <Link href={`/mass-selections/${selection.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
