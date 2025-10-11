import Footer from "@/components/common/footer";
import Header from "@/components/app/layout/Header";
import SideNav from "@/components/app/layout/SideNav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SideNav />
      <div className="flex flex-1 flex-col md:ml-16 md:transition-all md:duration-300 md:ease-in-out">
        <main className="container flex flex-1 py-10">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
