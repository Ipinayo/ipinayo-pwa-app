import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Heart, MapPin, Music } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUserProfile } from "@/lib/actions/user";

export default async function ProfilePage() {
  const userProfile = await getUserProfile();

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-display text-foreground">My Profile</h2>
          <Button asChild variant="outline">
            <Link href="/settings/profile">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={userProfile.user.image || undefined}
                    alt="User Avatar"
                  />
                  <AvatarFallback>
                    {(userProfile.user.name || userProfile.user.email)
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">
                    {userProfile.user.name}
                  </CardTitle>
                  {userProfile.headline && (
                    <p className="text-sm text-muted-foreground italic mt-1">
                      {userProfile.headline}
                    </p>
                  )}
                  <CardDescription className="text-base mt-2">
                    {userProfile.user.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </p>
                  <p className="text-base">{userProfile.user.name || "--"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-base">{userProfile.user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Your Headline
                </p>
                <p className="text-base">
                  {userProfile.headline || "Not specified"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>Bio</CardTitle>
              <CardDescription>About you</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-base whitespace-pre-wrap">
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
              <CardDescription>
                Your musical skills and preferences
              </CardDescription>
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

          {/* Location & Parish */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Parish & Choir Information
              </CardTitle>
              <CardDescription>
                The parish and choir for whom you make liturgical selections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Choir Name
                </p>
                <p className="text-base">
                  {userProfile.choirName || "Not specified"}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Parish Name
                  </p>
                  <p className="text-base">
                    {userProfile.parishName || "Not specified"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Country
                  </p>
                  <p className="text-base">
                    {userProfile.parishLocation?.country || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    State/Province
                  </p>
                  <p className="text-base">
                    {userProfile.parishLocation?.state || "Not specified"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    City
                  </p>
                  <p className="text-base">
                    {userProfile.parishLocation?.city || "Not specified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
