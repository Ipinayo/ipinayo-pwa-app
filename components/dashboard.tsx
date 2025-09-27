"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Copy,
  Download,
  Edit,
  Eye,
  Filter,
  Globe,
  Lock,
  LogOut,
  MoreVertical,
  Music,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActionState, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SampleDataBanner } from "@/components/sample-data-banner";
import { Separator } from "@/components/ui/separator";
import { logout } from "@/lib/actions/auth";
import { useSession } from "next-auth/react";

interface MassPart {
  id: string;
  partName: string;
  keySignature?: string;
  notes?: string;
}

interface MassSelection {
  id: string;
  title: string;
  date: string;
  templateType: string;
  liturgicalYear?: string;
  season?: string;
  themes?: string;
  pastoralFocus?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    name?: string;
    email: string;
  };
  parts: MassPart[];
  _count: {
    parts: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function Dashboard() {
  const { data: session } = useSession();
  const [selections, setSelections] = useState<MassSelection[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [_, logoutAction, logoutIsPending] = useActionState(logout, undefined);

  useEffect(() => {
    fetchSelections();
  }, [pagination.page, searchQuery, seasonFilter, sortBy, sortOrder]);

  const fetchSelections = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchQuery,
        season: seasonFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/mass-selections?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSelections(data.selections);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching selections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async (id: string) => {
    try {
      const response = await fetch(`/api/mass-selections/${id}/clone`, {
        method: "POST",
      });
      if (response.ok) {
        fetchSelections(); // Refresh the list
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
        fetchSelections(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting selection:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOwner = (selection: MassSelection) => {
    return session?.user?.email === selection.createdBy.email;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/images/logo.png"
                alt="logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-2xl font-display text-primary">Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={session?.user?.image || ""}
                        alt={session?.user?.name || ""}
                      />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session?.user?.name && (
                        <p className="font-medium">{session.user.name}</p>
                      )}
                      {session?.user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <DropdownMenuItem asChild>
                    <form
                      action={logoutAction}
                      className="flex w-full justify-start"
                    >
                      <Button
                        variant="outline"
                        className="flex w-full justify-start"
                        size="sm"
                        disabled={logoutIsPending}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </Button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display text-foreground mb-2">
              Mass Selections
            </h2>
            <p className="text-muted-foreground">
              Create, manage, and share Catholic Mass selections
            </p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/create">
              <Plus className="mr-2 h-4 w-4" />
              New Selection
            </Link>
          </Button>
        </div>

        <SampleDataBanner />

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mass selections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={seasonFilter} onValueChange={setSeasonFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                <SelectItem value="Ordinary Time">Ordinary Time</SelectItem>
                <SelectItem value="Advent">Advent</SelectItem>
                <SelectItem value="Christmas">Christmas</SelectItem>
                <SelectItem value="Lent">Lent</SelectItem>
                <SelectItem value="Easter">Easter</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-");
                setSortBy(field);
                setSortOrder(order as "asc" | "desc");
              }}
            >
              <SelectTrigger className="w-[140px]">
                {sortOrder === "asc" ? (
                  <SortAsc className="mr-2 h-4 w-4" />
                ) : (
                  <SortDesc className="mr-2 h-4 w-4" />
                )}
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt-desc">Latest First</SelectItem>
                <SelectItem value="updatedAt-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
                <SelectItem value="date-desc">Date (Newest)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selections Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : selections.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Music className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || seasonFilter !== "all"
                  ? "No Matching Selections"
                  : "No Mass Selections Yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || seasonFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first Mass selection to get started"}
              </p>
              {!searchQuery && seasonFilter === "all" && (
                <Button asChild>
                  <Link href="/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Selection
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {selections.map((selection) => (
              <Card
                key={selection.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 mb-1">
                        {selection.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(selection.date)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {selection.isPublic ? (
                        <Badge variant="secondary" className="text-xs">
                          <Globe className="mr-1 h-3 w-3" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="mr-1 h-3 w-3" />
                          Private
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/view/${selection.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          {isOwner(selection) && (
                            <DropdownMenuItem asChild>
                              <Link href={`/edit/${selection.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleClone(selection.id)}
                          >
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
                          {isOwner(selection) && (
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
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Music className="h-3 w-3" />
                      {selection._count.parts} parts • {selection.templateType}
                    </div>

                    {selection.season && (
                      <Badge variant="outline" className="text-xs">
                        {selection.season}
                      </Badge>
                    )}

                    {selection.themes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {selection.themes}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        by{" "}
                        {selection.createdBy.name || selection.createdBy.email}
                      </span>
                      <span>
                        Updated{" "}
                        {new Date(selection.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
