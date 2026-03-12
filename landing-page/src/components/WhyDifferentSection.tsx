import { MapPin, Eye, Target } from "lucide-react";
import { ScrollRevealSection, ScrollRevealItem } from "./ScrollReveal";

const cards = [
  {
    icon: MapPin,
    title: "Malaysia-Focused Region",
    description: "Built specifically for the Malaysian investment landscape. Understands local scam tactics, Bahasa Malaysia content, and SC Malaysia regulations.",
    borderClass: "border-t-asean-red",
    iconBg: "bg-asean-red/10",
    iconColor: "text-asean-red",
  },
  {
    icon: Eye,
    title: "Explainable AI Verdicts",
    description: "No black boxes. Every verdict comes with evidence quotes pulled directly from the website, so you understand exactly why something is flagged.",
    borderClass: "border-t-asean-gold",
    iconBg: "bg-asean-gold/10",
    iconColor: "text-asean-gold",
  },
  {
    icon: Target,
    title: "Investment-Only Focused",
    description: "Unlike generic scam detectors, ScamBuster is purpose-built for investment scams — the #1 category of financial fraud in Malaysia.",
    borderClass: "border-t-asean-green",
    iconBg: "bg-asean-green/10",
    iconColor: "text-asean-green",
  },
];

const WhyDifferentSection = () => {
  return (
    <section className="py-20 md:py-28 bg-light-tint">
      <div className="container mx-auto px-4">
        <ScrollRevealSection className="text-center mb-16">
          <ScrollRevealItem>
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Why ScamBuster</p>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <h2 className="font-display text-3xl md:text-5xl text-foreground">Built Different From Day One</h2>
          </ScrollRevealItem>
        </ScrollRevealSection>

        <ScrollRevealSection className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {cards.map((card) => (
            <ScrollRevealItem key={card.title}>
              <div className={`bg-background rounded-2xl p-8 border border-border border-t-4 ${card.borderClass} glow-card shadow-sm`}>
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-5`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <h3 className="font-sans font-bold text-lg text-foreground mb-3">{card.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{card.description}</p>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealSection>
      </div>
    </section>
  );
};

export default WhyDifferentSection;
