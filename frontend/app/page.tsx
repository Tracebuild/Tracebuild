import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import KpiBar from "@/components/landing/KpiBar";
import Features from "@/components/landing/Features";
import Workflow from "@/components/landing/Workflow";
import Security from "@/components/landing/Security";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="bg-[#F2EDE4]">
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
