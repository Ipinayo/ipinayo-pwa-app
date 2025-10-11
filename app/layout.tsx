import "../ui/globals.css";

import type { Metadata, Viewport } from "next";
import { geistMono, pattaya, playfairDisplay, sourceSans } from "../ui/fonts";

import { Analytics } from "@vercel/analytics/next";
import { OfflineIndicator } from "@/components/offline-indicator";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Ìpínayò - Sharing joy through music",
  description:
    "Create and manage Catholic Mass selections with ease. Sharing joy through music.",
  generator: "Ìpínayò",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ìpínayò",
  },
  keywords: ["Catholic", "Mass", "Music", "Liturgy", "PWA", "Offline"],
  authors: [{ name: "Ìpínayò" }],
  creator: "Ìpínayò",
  publisher: "Ìpínayò",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Ìpínayò",
    title: "Ìpínayò - Sharing joy through music",
    description:
      "Create and manage Catholic Mass selections with ease. Sharing joy through music.",
  },
  twitter: {
    card: "summary",
    title: "Ìpínayò - Sharing joy through music",
    description:
      "Create and manage Catholic Mass selections with ease. Sharing joy through music.",
  },
};

export const viewport: Viewport = {
  themeColor: "#175bea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${pattaya.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster duration={5000} richColors closeButton expand />
            <PWAInstallPrompt />
            <OfflineIndicator />
          </SessionProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
