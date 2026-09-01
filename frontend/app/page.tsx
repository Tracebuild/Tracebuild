import SmoothScrollProvider from "@/components/landing/redesign/SmoothScrollProvider";
import Navbar from "@/components/landing/redesign/Navbar";
import Hero from "@/components/landing/redesign/Hero";
import ProblemSolution from "@/components/landing/redesign/ProblemSolution";
import Showcase from "@/components/landing/redesign/Showcase";
import TrustBlocks from "@/components/landing/redesign/TrustBlocks";
import Pricing from "@/components/landing/redesign/Pricing";
import TeamContact from "@/components/landing/redesign/TeamContact";
import FinalCta from "@/components/landing/redesign/FinalCta";
import Footer from "@/components/landing/redesign/Footer";

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <div className="tb-landing">
        <div className="tb-grain" />
        <Navbar />
        <main>
          <Hero />
          <ProblemSolution />
          <Showcase />
          <TrustBlocks />
          <Pricing />
          <TeamContact />
          <FinalCta />
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
