import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container flex flex-col items-center justify-between md:flex-row">
        <p className="text-muted-foreground text-sm">© 2025 Ipinayo. All rights reserved.</p>
        <div className="mt-4 flex gap-4 md:mt-0">
          <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm">
            Terms
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm">
            Privacy
          </Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground text-sm">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
