import { Link } from "react-router-dom";
import { FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isLoggedIn?: boolean;
  onAuthClick?: () => void;
}

export function Header({ isLoggedIn, onAuthClick }: HeaderProps) {
  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">
            Bank Statement Converter
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Button variant="outline" size="sm" onClick={onAuthClick}>
            <User className="w-4 h-4 mr-2" />
            {isLoggedIn ? "Account" : "Sign In"}
          </Button>
        </nav>
      </div>
    </header>
  );
}
