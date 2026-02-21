import Footer from "@/components/common/footer";
import { requireNoAuth } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireNoAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex grow">{children}</main>
      <Footer />
    </div>
  );
}
