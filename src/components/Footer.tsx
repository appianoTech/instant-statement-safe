import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-muted/30 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm">
              Your privacy is guaranteed. We never store your files.
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Bank Statement Converter
            </span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
