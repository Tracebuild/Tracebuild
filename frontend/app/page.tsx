import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import KpiBar from "@/components/landing/KpiBar";
import Features from "@/components/landing/Features";
import Workflow from "@/components/landing/Workflow";
import Security from "@/components/landing/Security";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="bg-[#0D0D0F]">
      <Navbar />
      <Hero />
      <KpiBar />
      <Features />
      <Workflow />
      <Security />
      <Footer />
    </div>
  );
}
