import { Chrome, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollRevealSection, ScrollRevealItem } from "./ScrollReveal";


const HeroSection = () => {
  return (
    <section id="home" className="relative pt-20 pb-10 texture-bg overflow-visible">
      <ScrollRevealSection className="container mx-auto px-4 text-center max-w-4xl">
        <ScrollRevealItem>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-tight mb-6">
            Stop Investment Scams Before You Lose{" "}
            <span className="text-asean-red">A Ringgit</span>
          </h1>
        </ScrollRevealItem>

        <ScrollRevealItem>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            ScamBuster is a Chrome extension powered by AI that reads investment websites in
            Bahasa Malaysia and English — and tells you if it's a scam before you invest.
          </p>
        </ScrollRevealItem>

        <ScrollRevealItem>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Button size="lg" className="bg-asean-green text-asean-green-foreground hover:bg-asean-green/90 font-semibold text-base px-8 py-6 gap-2 shadow-lg">
              <Chrome className="w-5 h-5" />
              Add to Chrome — Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-base px-8 py-6 gap-2"
              asChild>
              
              <a href="#how-it-works">
                <ArrowDown className="w-5 h-5" />
                See How It Works
              </a>
            </Button>
          </div>
        </ScrollRevealItem>

      </ScrollRevealSection>
    </section>
  );
};

export default HeroSection;