import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { WhyBrinexSection } from "@/components/landing/why-brinex-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { Footer } from "@/components/landing/footer";
import { SmoothScroll } from "@/components/landing/smooth-scroll";

export default function Home() {
  return (
    <main>
      <SmoothScroll />
      <Navbar />
      <HeroSection />
      <WhyBrinexSection />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <Footer />
    </main>
  );
}
