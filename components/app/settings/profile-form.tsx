import { Badge, Heart, MapPin, Music, Plus, Save, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { vocalFachOptions } from "@/lib/constants";

export default function ProfileForm() {
  return (
    <form>
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
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">Your Headline</Label>
            <Input
              id="headline"
              value={userData.headline || ""}
              onChange={(e) =>
                setUserData({ ...userData, headline: e.target.value })
              }
              placeholder="e.g. Music Director | Organist | Composer | Soprano"
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground">
              {userData.headline?.length || 0}/150 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle>Bio</CardTitle>
          <CardDescription>
            Tell us about yourself and your ministry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={userData.bio}
            onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
            rows={5}
            placeholder="Share your story, experience, and passion for liturgical music..."
          />
        </CardContent>
      </Card>

      {/* Musical Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Musical Profile
          </CardTitle>
          <CardDescription>Your musical skills and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instruments */}
          <div className="space-y-2">
            <Label>Instruments</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {userData.instruments.map((instrument) => (
                <Badge key={instrument} variant="secondary" className="gap-1">
                  {instrument}
                  <button
                    onClick={() => removeInstrument(instrument)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add instrument"
                value={newInstrument}
                onChange={(e) => setNewInstrument(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addInstrument()}
              />
              <Button onClick={addInstrument} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vocalFach">Vocal Fach</Label>
            <Select
              value={userData.vocalFach || ""}
              onValueChange={(value) =>
                setUserData({ ...userData, vocalFach: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vocal fach" />
              </SelectTrigger>
              <SelectContent>
                {vocalFachOptions.map((fach) => (
                  <SelectItem key={fach} value={fach}>
                    {fach}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Favorite Genres */}
          <div className="space-y-2">
            <Label>Favorite Genres</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {userData.favoriteGenres.map((genre) => (
                <Badge key={genre} variant="outline" className="gap-1">
                  <Heart className="h-3 w-3" />
                  {genre}
                  <button
                    onClick={() => removeGenre(genre)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add genre"
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addGenre()}
              />
              <Button onClick={addGenre} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location & Parish */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location & Parish
          </CardTitle>
          <CardDescription>
            Your geographical information and parish details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={profileData.country || ""}
                onChange={(e) =>
                  setProfileData({ ...profileData, country: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={profileData.region || ""}
                onChange={(e) =>
                  setProfileData({ ...profileData, region: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="locality">Locality</Label>
              <Input
                id="locality"
                value={profileData.locality || ""}
                onChange={(e) =>
                  setProfileData({ ...profileData, locality: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parishName">Parish Name</Label>
              <Input
                id="parishName"
                value={profileData.parishName || ""}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    parishName: e.target.value,
                  })
                }
                placeholder="Your parish name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
