import { AppShell } from "@/components/app/assistant/app-shell";
import { Assistant } from "@/components/app/assistant";
import { AssistantProvider } from "@/components/app/assistant/assistant-provider";
import Footer from "@/components/common/footer";
import Header from "@/components/app/layout/Header";
import HeaderSkeleton from "@/components/app/layout/HeaderSkeleton";
import { PushNotificationPrompt } from "@/components/push-notification-prompt";
import SideNav from "@/components/app/layout/SideNav";
import { Suspense } from "react";
import { auth } from "@/auth";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <AssistantProvider isAuthenticated={!!session?.user}>
      {/* AppShell wraps the whole app so the docked assistant shifts the top
          nav too, not just the page body. */}
      <AppShell>
        <div className="flex min-h-screen flex-col">
          <Suspense fallback={<HeaderSkeleton />}>
            <Header />
          </Suspense>
          <SideNav />
          <div className="flex flex-1 flex-col md:ml-16 md:transition-all md:duration-300 md:ease-in-out">
            <main className="container flex flex-1 py-8 sm:py-10">
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </AppShell>
      <Assistant />
      {session?.user && <PushNotificationPrompt />}
    </AssistantProvider>
  );
}
