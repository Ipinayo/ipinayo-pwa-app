import "../ui/globals.css";

import { geistMono, pattaya, playfairDisplay, sourceSans } from "../ui/fonts";

import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { OfflineIndicator } from "@/components/offline-indicator";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "ipinayo - Catholic Mass Selections",
  description:
    "Create and manage Catholic Mass selections with ease. Sharing joy through music.",
  generator: "ipinayo",
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#175bea" },
    { media: "(prefers-color-scheme: dark)", color: "#030f2b" },
  ],
  viewport:
    "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ipinayo",
  },
  keywords: ["Catholic", "Mass", "Music", "Liturgy", "PWA", "Offline"],
  authors: [{ name: "ipinayo" }],
  creator: "ipinayo",
  publisher: "ipinayo",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "ipinayo",
    title: "ipinayo - Catholic Mass Selections",
    description:
      "Create and manage Catholic Mass selections with ease. Sharing joy through music.",
  },
  twitter: {
    card: "summary",
    title: "ipinayo - Catholic Mass Selections",
    description:
      "Create and manage Catholic Mass selections with ease. Sharing joy through music.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sourceSans.variable} ${pattaya.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
      >
        <Suspense fallback={<div>Loading...</div>}>
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
        </Suspense>
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
