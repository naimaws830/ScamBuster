import { ScrollRevealSection, ScrollRevealItem } from "./ScrollReveal";

const stats = [
{ value: "RM1.57B", label: "Lost to scams in 2024", color: "text-asean-red" },
{ value: "800+", label: "SC Malaysia blacklisted sites", color: "text-primary" },
{ value: "23%", label: "Of all scams are investment", color: "text-asean-gold" },
{ value: "2%", label: "Of victims recover their money", color: "text-asean-green" }];


const StatsSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <ScrollRevealSection className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <ScrollRevealItem key={index}>
              <div className="text-center">
                <div className={`font-display text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            </ScrollRevealItem>
          ))}
        </div>
      </ScrollRevealSection>
    </section>
  );
};

export default StatsSection;