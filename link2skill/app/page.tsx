// Feature: link2skill-platform
// Link2Skill landing page — root route
// Server component

import Header from "@/app/components/Header";
import HeroSection from "@/app/components/HeroSection";
import HowItWorks from "@/app/components/HowItWorks";
import SkillsSection from "@/app/components/SkillsSection";
import BilingualSection from "@/app/components/BilingualSection";
import CTASection from "@/app/components/CTASection";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <HeroSection />
        <HowItWorks />
        <SkillsSection />
        <BilingualSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
