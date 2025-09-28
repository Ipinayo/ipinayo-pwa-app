import Footer from "@/components/common/footer";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex grow">{children}</main>
      <Footer />
    </div>
  );
}
