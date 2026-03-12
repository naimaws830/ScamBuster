import { Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollRevealSection, ScrollRevealItem } from "./ScrollReveal";

const CTABanner = () => {
  return (
    <section className="asean-gradient py-20 md:py-28">
      <ScrollRevealSection className="container mx-auto px-4 text-center max-w-3xl">
        <ScrollRevealItem>
          <h2 className="font-display text-3xl md:text-5xl text-primary-foreground mb-6 leading-tight">
            Someone You Know Will Receive A Scam Link{" "}
            <span className="text-asean-gold">This Week</span>
          </h2>
        </ScrollRevealItem>
        <ScrollRevealItem>
          <p className="text-primary-foreground/60 text-lg mb-10">
            Protect yourself and your family before it's too late. ScamBuster takes 10 seconds to install and works immediately.
          </p>
        </ScrollRevealItem>
        <ScrollRevealItem>
          <Button
            size="lg"
            className="bg-asean-red text-asean-red-foreground hover:bg-asean-red/90 font-semibold text-lg px-10 py-7 gap-3 shadow-lg"
          >
            <Chrome className="w-6 h-6" />
            Add to Chrome — Free
          </Button>
        </ScrollRevealItem>
      </ScrollRevealSection>
    </section>
  );
};

export default CTABanner;
