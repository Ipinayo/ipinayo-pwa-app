import {
  BookOpen,
  Calendar,
  Globe,
  Heart,
  Lock,
  MapPin,
  Music,
  ShieldUser,
  TrendingUp,
  TrendingUpDown,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatParishInfo, isAdmin } from "@/lib/utils";
import { getUserProfile, getUserSelectionStats } from "@/lib/actions/admin";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import UserAvatar from "@/components/common/user-avatar";

export default async function UserDetails({
  userId,
}: Readonly<{ userId: string }>) {
  const userProfile = await getUserProfile(userId);
  const userStats = await getUserSelectionStats(userId);
  const user = userProfile.user;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <UserAvatar user={user} className="h-20 w-20" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-display font-bold">
                  {user.name || "Anonymous"}
                </h1>
                {isAdmin(user.userRole) ? (
                  <Badge variant="secondary" className="gap-1">
                    <ShieldUser className="h-3 w-3" />
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <User className="h-3 w-3" />
                    User
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user.email}</p>
              {userProfile.headline && (
                <p className="text-sm italic mt-1">{userProfile.headline}</p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Signup Date</p>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Choir name</p>
                <p className="font-medium">
                  {userProfile.choirName || "Unnamed Choir"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Parish Location</p>
                <p className="font-medium">
                  {formatParishInfo(
                    userProfile.parishLocation,
                    userProfile.parishName,
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader>
            <CardTitle>Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {userProfile.bio || "No bio added"}
            </p>
          </CardContent>
        </Card>

        {/* Musical Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Musical Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instruments */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Instruments
              </p>
              <div className="flex flex-wrap gap-2">
                {userProfile.instruments.length > 0 ? (
                  userProfile.instruments.map((instrument) => (
                    <Badge key={instrument} variant="secondary">
                      {instrument}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No instruments added
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Vocal Fach
              </p>
              <p className="text-base">
                {userProfile.vocalFach || "Not specified"}
              </p>
            </div>

            {/* Favorite Genres */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Favorite Genres
              </p>
              <div className="flex flex-wrap gap-2">
                {userProfile.favoriteGenres.length > 0 ? (
                  userProfile.favoriteGenres.map((genre) => (
                    <Badge key={genre} variant="outline">
                      <Heart className="h-3 w-3 mr-1" />
                      {genre}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No genres added
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Mass Selections</span>
              </div>
              <span className="text-lg font-bold">{userStats.total}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-500" />
                <span className="text-sm">Drafts</span>
              </div>
              <span className="text-lg font-bold">{userStats.totalDrafts}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Public Selections</span>
              </div>
              <span className="text-lg font-bold">{userStats.public}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Private Selections</span>
              </div>
              <span className="text-lg font-bold">{userStats.private}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUpDown className="h-4 w-4 text-green-500" />
                <span className="text-sm">Selections this month</span>
              </div>
              <span className="text-lg font-bold">{userStats.thisMonth}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Selections this week</span>
              </div>
              <span className="text-lg font-bold">{userStats.thisWeek}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
