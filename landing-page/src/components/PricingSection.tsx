import { Check, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollRevealSection, ScrollRevealItem } from "./ScrollReveal";

const plans = [
  {
    name: "Free",
    price: "RM0",
    period: "forever",
    badge: null,
    featured: false,
    features: [
      "5 scans per day",
      "Risk score 0 - 100",
      "Safe / Suspicious / Scam badge",
      "Basic scam warning",
    ],
    cta: "Add to Chrome — Free",
  },
  {
    name: "Premium",
    price: "RM10",
    period: "/month",
    badge: "Most Popular",
    featured: true,
    features: [
      "Everything in Free",
      "Unlimited scans",
      "scam type classification",
      "AI evidence-based reasons",
      "Domain age + owner privacy check",
      "Scan history",
      "Malay + English language detection",
    ],
    cta: "Start Premium",
  },
  {
    name: "Pro",
    price: "RM30",
    period: "/month",
    badge: null,
    featured: false,
    features: [
      "Everything in Premium",
      "Windows notification for detection result",
      "API access (for developers)",
      "Support more different language",
      "Priority support",
      "Export report to PDF",
    ],
    cta: "Start Pro",
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <ScrollRevealSection className="text-center mb-16">
          <ScrollRevealItem>
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Pricing</p>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <h2 className="font-display text-3xl md:text-5xl text-foreground">Simple, Transparent Pricing</h2>
          </ScrollRevealItem>
        </ScrollRevealSection>

        <ScrollRevealSection className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan) => (
            <ScrollRevealItem key={plan.name}>
              <div
                className={`relative rounded-2xl p-8 border glow-card shadow-sm ${
                  plan.featured
                    ? "bg-primary text-primary-foreground border-primary ring-2 ring-asean-gold"
                    : "bg-background border-border text-foreground"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-asean-gold text-asean-gold-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    {plan.badge}
                  </div>
                )}

                <h3 className="font-sans font-bold text-xl mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-4xl">{plan.price}</span>
                  <span className={`text-sm ${plan.featured ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.featured ? "text-asean-gold" : "text-asean-green"}`} />
                      <span className={plan.featured ? "text-primary-foreground/80" : "text-muted-foreground"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full font-semibold ${
                    plan.featured
                      ? "bg-asean-gold text-asean-gold-foreground hover:bg-asean-gold/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealSection>
      </div>
    </section>
  );
};

export default PricingSection;
