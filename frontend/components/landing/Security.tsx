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
    <section id="sicherheit" className="bg-[#F2EDE4] py-28 px-6">
      <div className="max-w-6xl mx-auto">

        <AnimatedSection className="mb-16">
          <p className="text-xs text-[#B7926A] uppercase tracking-widest mb-4 font-semibold">
            Vertrauen & Sicherheit
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#141414] leading-tight max-w-lg">
            Gebaut für professionelle Anforderungen im Bauwesen.
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {trustPoints.map((point, i) => (
            <AnimatedSection key={point.title} delay={i * 100}>
              <div className="bg-white border border-stone-200 rounded-2xl p-8 hover:border-[#B7926A]/40 hover:shadow-md transition-all duration-300">
                <div className="w-8 h-8 bg-stone-100 border border-stone-200 rounded-lg mb-6 flex items-center justify-center">
                  <span className="text-[#B7926A] text-xs font-bold">✓</span>
                </div>
                <h3 className="text-[#141414] font-semibold mb-3">{point.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{point.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
