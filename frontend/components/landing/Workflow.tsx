import AnimatedSection from "./AnimatedSection";

const steps = [
  {
    number: "01",
    title: "Upload",
    description:
      "Bauplan als PDF hochladen. TraceBuild erkennt Plantyp, Massstab und Projektkontext automatisch.",
  },
  {
    number: "02",
    title: "Analyse",
    description:
      "KI prüft jede Seite gegen relevante Normen – präzise, vollständig und in Minuten.",
  },
  {
    number: "03",
    title: "Review",
    description:
      "Ergebnisse im Dashboard einsehen, kommentieren und nach Priorität bearbeiten.",
  },
  {
    number: "04",
    title: "Report",
    description:
      "Finalen Prüfbericht exportieren – direkt ins Projektdossier oder an den Auftraggeber.",
  },
];

export default function Workflow() {
  return (
    <section id="workflow" className="bg-zinc-900 border-y border-zinc-800 py-28 px-6">
      <div className="max-w-6xl mx-auto">

        <AnimatedSection className="mb-16">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Workflow</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight max-w-lg">
            Von der Zeichnung zum Bericht in vier Schritten.
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <AnimatedSection key={step.number} delay={i * 100}>
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-stone-500 tabular-nums select-none">
                    {step.number}
                  </span>
                  <div className="h-px flex-1 bg-zinc-800" />
                </div>
                <h3 className="text-white font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
