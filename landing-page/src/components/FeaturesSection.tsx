import { Languages, Landmark, Brain, Globe, Cpu, Target } from "lucide-react";
import { ScrollRevealSection, ScrollRevealItem } from "./ScrollReveal";

const features = [
  { icon: Languages, title: "Bahasa Malaysia Detection", description: "Full natural language processing for both Bahasa Malaysia and English content on investment pages.", borderClass: "border-t-asean-green" },
  { icon: Landmark, title: "Tells Type Of Scams", description: "Identifies the type of scam by analyzing suspicious keywords and patterns on the webpage.", borderClass: "border-t-asean-red" },
  { icon: Brain, title: "Explainable AI", description: "Every verdict includes direct evidence quotes from the page so users understand the reasoning.", borderClass: "border-t-asean-gold" },
  { icon: Globe, title: "Domain Intelligence", description: "Analyzes domain age, registration data, and hosting patterns to identify freshly created scam sites.", borderClass: "border-t-asean-gold" },
  { icon: Cpu, title: "Dual Detection Engine", description: "Combines rule-based pattern matching with LLM analysis for maximum accuracy and speed.", borderClass: "border-t-asean-red" },
  { icon: Target, title: "Investment Scam Specialist", description: "Purpose-built models trained specifically on investment fraud patterns unique to Southeast Asia.", borderClass: "border-t-asean-green" },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28 asean-gradient">
      <div className="container mx-auto px-4">
        <ScrollRevealSection className="text-center mb-16">
          <ScrollRevealItem>
            <p className="text-asean-gold font-semibold text-sm uppercase tracking-wider mb-3">Features</p>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <h2 className="font-display text-3xl md:text-5xl text-primary-foreground">Everything You Need to Stay Safe</h2>
          </ScrollRevealItem>
        </ScrollRevealSection>

        <ScrollRevealSection className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f) => (
            <ScrollRevealItem key={f.title}>
              <div className={`bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-7 border border-primary-foreground/15 border-t-4 ${f.borderClass} glow-card group cursor-default`}>
                <div className="w-11 h-11 rounded-xl bg-primary-foreground/10 flex items-center justify-center mb-5 group-hover:bg-primary-foreground/20 transition-colors">
                  <f.icon className="w-5 h-5 text-asean-gold" />
                </div>
                <h3 className="font-sans font-bold text-base text-primary-foreground mb-2">{f.title}</h3>
                <p className="text-primary-foreground/60 text-sm leading-relaxed">{f.description}</p>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealSection>
      </div>
    </section>
  );
};

export default FeaturesSection;
