import { useState } from "react";
import { Shield, Menu, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoginModal from "./LoginModal";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Investment Advisor", href: "#investment-advisor" },
  { label: "Pricing", href: "#pricing" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <a href="#home" className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-asean-green" />
            <span className="font-sans font-bold text-lg text-foreground">ScamBuster</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-primary font-medium text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <Button
            onClick={() => setLoginOpen(true)}
            className="hidden md:flex items-center gap-2 font-semibold rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Button>

          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-muted-foreground hover:text-primary font-medium text-sm py-2"
              >
                {link.label}
              </a>
            ))}
            <Button
              onClick={() => { setMobileOpen(false); setLoginOpen(true); }}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Button>
          </div>
        )}
      </nav>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
};

export default Navbar;
