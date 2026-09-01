import SmoothScrollProvider from "@/components/landing/redesign/SmoothScrollProvider";
import Navbar from "@/components/landing/redesign/Navbar";
import Hero from "@/components/landing/redesign/Hero";
import ProblemSolution from "@/components/landing/redesign/ProblemSolution";

/* Sections below the hero land in later milestones. Stubs keep the nav anchors
   and active-section detection working in the meantime. */
function Stub({ id, label }: { id: string; label: string }) {
  return (
    <section
      id={id}
      style={{
        position: "relative",
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--tb-section-y) var(--tb-gutter)",
        color: "var(--tb-text-tertiary)",
        fontSize: 13,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </section>
  );
}

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <div className="tb-landing">
        <div className="tb-grain" />
        <Navbar />
        <main>
          <Hero />
          <ProblemSolution />
          <Stub id="produkt" label="Produkt-Showcase — folgt" />
          <span id="normen-datenbank" style={{ position: "absolute" }} />
          <Stub id="preise" label="Preise — folgt" />
          <Stub id="kontakt" label="Team & Kontakt — folgt" />
        </main>
      </div>
    </SmoothScrollProvider>
  );
}
