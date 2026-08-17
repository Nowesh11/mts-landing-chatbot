import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/layout/hero";
import { AboutSection } from "@/components/layout/about-section";
import { EsgSection } from "@/components/layout/esg-section";
import { ProcessFlowSection } from "@/components/layout/process-flow-section";
import { SolutionsSection } from "@/components/layout/solutions-section";
import { SectorSolutionsSection } from "@/components/layout/sector-solutions-section";
import { ClarityRevealSection } from "@/components/layout/clarity-reveal-section";
import { ResourcePanelsSection } from "@/components/layout/resource-panels-section";
import { WhyMtSmartSection } from "@/components/layout/why-mt-smart-section";
import { ProjectExperienceSection } from "@/components/layout/project-experience-section";
import { JourneySection } from "@/components/layout/journey-section";
import { FinalCtaSection } from "@/components/layout/final-cta-section";
import { ContactSection } from "@/components/layout/contact-section";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <Hero />
      <AboutSection />
      <EsgSection />
      <ProcessFlowSection />
      <SolutionsSection />
      <ClarityRevealSection />
      <ResourcePanelsSection />
      <SectorSolutionsSection />
      <WhyMtSmartSection />
      <ProjectExperienceSection />
      <JourneySection />
      <FinalCtaSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
