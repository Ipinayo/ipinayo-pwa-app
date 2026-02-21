import Footer from "@/components/common/footer";
import Header from "@/components/app/layout/Header";
import HeaderSkeleton from "@/components/app/layout/HeaderSkeleton";
import type React from "react";
import SideNav from "@/components/app/layout/SideNav";
import { Suspense } from "react";
import { getUser } from "@/lib/actions/user";
import { isAdmin } from "@/lib/utils";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuth("/admin");

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
