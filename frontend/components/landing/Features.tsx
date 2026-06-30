import AnimatedSection from "./AnimatedSection";

const features = [
  {
    icon: "◈",
    title: "Planprüfung",
    description:
      "Upload von Grundrissen, Schnitten und Ansichten. TraceBuild liest und interpretiert technische Zeichnungen vollautomatisch.",
    badge: "PDF · DWG · IFC",
  },
  {
    icon: "⊞",
    title: "Normencheck",
    description:
      "Automatischer Abgleich mit geltenden SIA-Normen, kantonalen Bauvorschriften und kundeneigenen Regelwerken.",
    badge: "SIA · Kantonal · ISO",
  },
  {
    icon: "◎",
    title: "Fehlererkennung",
    description:
      "Präzise Lokalisierung von Abweichungen – mit Fehlerkategorie, Schweregrad und konkretem Verbesserungsvorschlag.",
    badge: "Kritisch · Warnung · OK",
  },
  {
    icon: "▤",
    title: "Prüfbericht",
    description:
      "Exportierbarer Prüfbericht als PDF oder Excel – strukturiert, nachvollziehbar und direkt aus dem Dashboard.",
    badge: "PDF · XLSX",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-[#0D0D0F] py-28 px-6">
      <div className="max-w-6xl mx-auto">

        <AnimatedSection className="mb-16">
          <p className="text-xs text-[#B7926A]/70 uppercase tracking-widest mb-4">Funktionen</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight max-w-lg">
            Alles, was eine professionelle Planprüfung braucht.
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <AnimatedSection key={feature.title} delay={i * 80} className="flex">
              <div className="flex-1 bg-[#161616] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-5 hover:border-[#B7926A]/40 hover:bg-white/[0.03] transition-all duration-300 cursor-default">
                <span className="text-2xl text-[#B7926A] leading-none">{feature.icon}</span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-white font-semibold">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
                </div>
                <p className="text-xs text-zinc-600 mt-auto font-mono">{feature.badge}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
