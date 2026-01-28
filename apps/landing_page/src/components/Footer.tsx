import Image from "next/image";

export function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <a href="/" className="flex items-center gap-2">
            <Image
              src="/logo_bugable.png"
              alt="Bugable"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span className="font-display text-base font-bold tracking-tight">
              Bugable
            </span>
          </a>

          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Bugable
          </p>
        </div>
      </div>
    </footer>
  );
}
