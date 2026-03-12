import { ScrollRevealSection, ScrollRevealItem } from "./ScrollReveal";
import scambusterDanger from "@/assets/scambuster-danger.png";

const LiveDemoSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <ScrollRevealSection className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <ScrollRevealItem className="flex justify-center">
            <div className="w-full max-w-sm animate-float">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card">
                <img src={scambusterDanger} alt="ScamBuster danger analysis" className="w-full h-auto" />
              </div>
            </div>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <div>
              <p className="text-asean-red font-semibold text-sm uppercase tracking-wider mb-3">Live Detection Preview</p>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
                See Exactly Why It's a Scam
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-4">
                ScamBuster doesn't just say "danger" — it shows you the exact quotes from the page that triggered the warning. Phrases like <span className="text-asean-red font-semibold">"500% ROI"</span> and newly registered domains are highlighted as evidence.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                Every verdict comes with a confidence score and actionable evidence so you can make informed decisions about your investments.
              </p>
            </div>
          </ScrollRevealItem>
        </ScrollRevealSection>
      </div>
    </section>
  );
};

export default LiveDemoSection;
