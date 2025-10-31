import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, Music, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section>
        <div className="from-primary-light to-primary relative overflow-hidden rounded-2xl bg-gradient-to-r p-4 text-white md:p-6">
          {/* Animated background elements */}
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/20 md:h-32 md:w-32" />
          <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-white/10 md:h-48 md:w-48" />

          {/* Content */}
          <div className="relative max-w-2xl">
            <h1 className="font-pattaya mb-2 text-2xl md:text-3xl">
              Sharing Joy Through Music
            </h1>
            <p className="mb-3 text-sm md:text-base">
              Create and share liturgical selections with ease. From Sunday Mass
              to special liturgies, organize your musical selections
              beautifully.
            </p>
            <div>
              <Button size="sm" variant="secondary" asChild>
                <Link href="/mass-selections">
                  Browse Liturgical Selections
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg">Liturgical Templates</h3>
            <p className="text-sm text-muted-foreground">
              Choose from Sunday Mass, Wedding, Funeral, and more pre-configured
              templates.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg">Share & Collaborate</h3>
            <p className="text-sm text-muted-foreground">
              Make selections public for others to view and clone for their own
              use.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg">Organized Planning</h3>
            <p className="text-sm text-muted-foreground">
              Track liturgical year, seasons, themes, and pastoral focus for
              each Liturgy.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg">PDF Export</h3>
            <p className="text-sm text-muted-foreground">
              Generate professional PDFs of your selections for printing and
              sharing.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8 py-8 text-center">
        <h2 className="font-pattaya mb-4 text-2xl">
          Ready to create and share your Liturgical selections?
        </h2>
        <p className="text-muted-foreground mx-auto mb-6 max-w-md">
          Join our community and share your selections with the world.
        </p>
        <Button asChild>
          <Link href="/mass-selections/new">Create Selection</Link>
        </Button>
      </section>
    </div>
  );
}
