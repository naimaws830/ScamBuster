import iconSearch from "@/assets/icon-search.png";
import iconBrain from "@/assets/icon-brain.png";
import iconShield from "@/assets/icon-shield.png";
import { ScrollRevealSection, ScrollRevealItem } from "./ScrollReveal";

const steps = [
  {
    num: "1",
    title: "Open Any Website",
    description: "Navigate to any investment website in Chrome. ScamBuster activates automatically — no setup required.",
    img: iconSearch,
    borderColor: "border-t-asean-red",
  },
  {
    num: "2",
    title: "AI Reads The Full Page",
    description: "Our AI engine analyzes the entire page content in Bahasa Malaysia and English, checking against known scam patterns and SC Malaysia data.",
    img: iconBrain,
    borderColor: "border-t-asean-gold",
  },
  {
    num: "3",
    title: "Instant Verdict",
    description: "Get a clear safe or danger verdict in under 3 seconds, complete with evidence quotes pulled directly from the page.",
    img: iconShield,
    borderColor: "border-t-asean-green",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-light-tint">
      <div className="container mx-auto px-4">
        <ScrollRevealSection className="text-center mb-16">
          <ScrollRevealItem>
            <p className="text-asean-green font-semibold text-sm uppercase tracking-wider mb-3">How It Works</p>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <h2 className="font-display text-3xl md:text-5xl text-foreground">Three Steps to Safety</h2>
          </ScrollRevealItem>
        </ScrollRevealSection>

        <ScrollRevealSection className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step) => (
            <ScrollRevealItem key={step.num}>
              <div className={`relative bg-background rounded-2xl p-8 border border-border border-t-4 ${step.borderColor} glow-card group shadow-sm`}>
                <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.num}
                </div>
                <img src={step.img} alt={step.title} className="w-16 h-16 mb-5 mt-2" />
                <h3 className="font-sans font-bold text-xl text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealSection>
      </div>
    </section>
  );
};

export default HowItWorksSection;
