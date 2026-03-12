import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import LiveDemoSection from "@/components/LiveDemoSection";
import WhyDifferentSection from "@/components/WhyDifferentSection";
import FeaturesSection from "@/components/FeaturesSection";
import InvestmentAdvisorSection from "@/components/InvestmentAdvisorSection";
import PricingSection from "@/components/PricingSection";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <LiveDemoSection />
      <WhyDifferentSection />
      <FeaturesSection />
      <InvestmentAdvisorSection />
      <PricingSection />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default Index;
