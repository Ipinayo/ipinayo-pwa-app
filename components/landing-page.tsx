"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, Music, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { signIn } from "next-auth/react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/images/logo.png"
              alt="ipinayo"
              width={300}
              height={120}
              className="h-20 w-auto"
              priority
            />
          </div>

          {/* Hero Content */}
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-display text-balance leading-tight">
              Catholic Mass Selections
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-pretty leading-relaxed">
              Create, manage, and share liturgical plans with ease. From Sunday
              Mass to special celebrations, organize your musical selections
              beautifully.
            </p>

            <div className="pt-4">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-xl"
                onClick={() => signIn()}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg">Mass Templates</h3>
              <p className="text-sm text-muted-foreground">
                Choose from Sunday Mass, Wedding, Funeral, and more
                pre-configured templates.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display text-lg">Share & Collaborate</h3>
              <p className="text-sm text-muted-foreground">
                Make selections public for others to view and clone for their
                own use.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display text-lg">Organized Planning</h3>
              <p className="text-sm text-muted-foreground">
                Track liturgical year, seasons, themes, and pastoral focus for
                each Mass.
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
                Generate professional PDFs of your Mass selections for printing
                and sharing.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
