import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 bg-zinc-950 overflow-hidden">
      {/* Subtle dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]" />
      {/* Top glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#ffffff0d,transparent)]" />

      <div className="relative max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 mb-10">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <span className="text-xs text-zinc-400 font-medium tracking-wide">KI-gestützte Planprüfung</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6">
          Baupläne prüfen.<br />
          <span className="text-stone-400">Fehler finden.</span><br />
          Normen einhalten.
        </h1>

        <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-12 leading-relaxed">
          TraceBuild analysiert technische Zeichnungen automatisch auf Abweichungen,
          Normverstösse und Vorschriften – und erstellt nachvollziehbare Prüfberichte.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto bg-white text-zinc-950 px-8 py-3 rounded-lg text-sm font-semibold hover:bg-zinc-100 transition-colors"
          >
            Jetzt starten
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto text-sm text-zinc-400 border border-zinc-800 px-8 py-3 rounded-lg hover:bg-zinc-900 hover:text-white transition-colors"
          >
            Features entdecken
          </a>
        </div>
      </div>
    </section>
  );
}
