import { Shield } from "lucide-react";
import { ScrollRevealSection, ScrollRevealItem } from "./ScrollReveal";

const Footer = () => {
  return (
    <footer className="bg-secondary py-12">
      <ScrollRevealSection className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          <ScrollRevealItem>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-6 h-6 text-asean-gold" />
                <span className="font-sans font-bold text-secondary-foreground">ScamBuster</span>
              </div>
              <p className="text-secondary-foreground/50 text-sm">Protecting Malaysian Investors</p>
            </div>
          </ScrollRevealItem>

          <ScrollRevealItem>
            <div className="flex flex-col gap-2">
              <p className="font-sans font-semibold text-secondary-foreground text-sm mb-1">Navigation</p>
              {["Home", "How It Works", "Features", "Pricing"].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace(/ /g, "-")}`}
                  className="text-secondary-foreground/50 hover:text-asean-gold text-sm transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </ScrollRevealItem>

          <ScrollRevealItem>
            <div>
              <p className="font-sans font-semibold text-secondary-foreground text-sm mb-3">Built for Malaysia 🇲🇾</p>
              <p className="text-secondary-foreground/40 text-xs leading-relaxed">
                ScamBuster is an independent tool and is not affiliated with any government agency.
                It uses publicly available data from PDRM CCID, Securities Commission Malaysia (SC Malaysia),
                and the Global Anti-Scam Alliance (GASA) 2024 report for reference purposes.
              </p>
            </div>
          </ScrollRevealItem>
        </div>

        <ScrollRevealItem>
          <div className="border-t border-secondary-foreground/10 pt-6 text-center">
            <p className="text-secondary-foreground/30 text-xs">
              © {new Date().getFullYear()} ScamBuster. All rights reserved.
            </p>
          </div>
        </ScrollRevealItem>
      </ScrollRevealSection>
    </footer>
  );
};

export default Footer;
