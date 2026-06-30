import AnimatedSection from "./AnimatedSection";

const trustPoints = [
  {
    title: "Datensicherheit",
    description:
      "Ihre Pläne verlassen niemals die Schweiz. Alle Daten werden verschlüsselt gespeichert und verarbeitet.",
  },
  {
    title: "Revisionssicher",
    description:
      "Jede Prüfung ist vollständig nachvollziehbar und mit Zeitstempel dokumentiert – bereit für Audits.",
  },
  {
    title: "Normkonform",
    description:
      "Laufend aktualisierte Normdatenbank: SIA, kantonales Recht und kundeneigene Vorschriften inklusive.",
  },
];

export default function Security() {
  return (
    <section id="sicherheit" className="bg-[#0D0D0F] py-28 px-6">
      <div className="max-w-6xl mx-auto">

        <AnimatedSection className="mb-16">
          <p className="text-xs text-[#B7926A]/70 uppercase tracking-widest mb-4">
            Vertrauen & Sicherheit
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight max-w-lg">
            Gebaut für professionelle Anforderungen im Bauwesen.
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {trustPoints.map((point, i) => (
            <AnimatedSection key={point.title} delay={i * 100}>
              <div className="bg-[#161616] border border-white/[0.08] rounded-2xl p-8 hover:border-[#B7926A]/30 transition-colors duration-300">
                <div className="w-8 h-8 bg-white/[0.06] border border-white/[0.08] rounded-lg mb-6 flex items-center justify-center">
                  <span className="text-[#B7926A] text-xs font-bold">✓</span>
                </div>
                <h3 className="text-white font-semibold mb-3">{point.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{point.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
