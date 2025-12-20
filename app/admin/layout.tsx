import { Footer } from "react-day-picker";
import Header from "@/components/app/layout/Header";
import HeaderSkeleton from "@/components/app/layout/HeaderSkeleton";
import type React from "react";
import SideNav from "@/components/app/layout/SideNav";
import { Suspense } from "react";
import { auth } from "@/auth";
import { getUser } from "@/lib/actions/user";
import { isAdmin } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const user = await getUser();
  if (!isAdmin(user?.userRole)) redirect("/");

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<HeaderSkeleton />}>
        <Header adminNav />
      </Suspense>
      <SideNav adminNav />
      <div className="flex flex-1 flex-col md:ml-16 md:transition-all md:duration-300 md:ease-in-out">
        <main className="container flex flex-1 py-8 sm:py-10">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
