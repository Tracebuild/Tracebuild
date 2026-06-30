import Link from "next/link";

const previewItems = [
  { status: "ok",   label: "Grenzabstand SIA 422" },
  { status: "fail", label: "Gebäudehöhe RBG §45" },
  { status: "warn", label: "Fensterflächenanteil" },
  { status: "ok",   label: "Erschliessungsweg" },
  { status: "ok",   label: "Brandabschnitt DIN 4102" },
];

function StatusDot({ status }: { status: string }) {
  const color =
    status === "ok"   ? "bg-emerald-400" :
    status === "fail" ? "bg-red-400" :
                        "bg-amber-400";
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />;
}

function StatusLabel({ status }: { status: string }) {
  const color =
    status === "ok"   ? "text-emerald-500" :
    status === "fail" ? "text-red-400" :
                        "text-amber-400";
  return (
    <span className={`text-[10px] font-mono font-semibold tracking-wider ${color}`}>
      {status.toUpperCase()}
    </span>
  );
}

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center bg-zinc-950 overflow-hidden px-6">

      {/* ── Background: noise grain ───────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <filter id="tb-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.68"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#tb-noise)" />
      </svg>

      {/* ── Background: animated glow blobs ──────────────── */}
      <div
        className="absolute -top-24 left-[12%] w-[580px] h-[580px] rounded-full blur-[130px] bg-stone-500/10 animate-glow-drift pointer-events-none"
      />
      <div
        className="absolute top-[30%] right-[8%] w-[420px] h-[420px] rounded-full blur-[110px] bg-zinc-300/5 animate-glow-drift-alt pointer-events-none"
        style={{ animationDelay: "-8s" }}
      />
      <div
        className="absolute bottom-0 left-[35%] w-[500px] h-[500px] rounded-full blur-[140px] bg-stone-600/10 animate-glow-drift pointer-events-none"
        style={{ animationDelay: "-5s" }}
      />

      {/* ── Background: subtle grid ───────────────────────── */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:72px_72px]" />

      {/* ── Hero text ─────────────────────────────────────── */}
      <div className="relative w-full max-w-4xl text-center pt-44 pb-16">

        <div
          className="inline-flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-full px-4 py-1.5 mb-10 animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <span className="text-xs text-zinc-400 font-medium tracking-wide">
            KI-gestützte Planprüfung
          </span>
        </div>

        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6 animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          Baupläne prüfen.<br />
          <span className="text-stone-400">Fehler finden.</span><br />
          Normen einhalten.
        </h1>

        <p
          className="text-lg text-zinc-400 max-w-xl mx-auto mb-12 leading-relaxed animate-fade-up"
          style={{ animationDelay: "180ms" }}
        >
          TraceBuild analysiert technische Zeichnungen automatisch auf Abweichungen,
          Normverstösse und Vorschriften – und erstellt nachvollziehbare Prüfberichte.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up"
          style={{ animationDelay: "280ms" }}
        >
          <Link
            href="/login"
            className="group w-full sm:w-auto bg-white text-zinc-950 px-8 py-3 rounded-lg text-sm font-semibold hover:bg-zinc-100 active:scale-[0.97] transition-all duration-150"
          >
            Jetzt starten
            <span className="inline-block ml-1.5 transition-transform duration-150 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto text-sm text-zinc-400 border border-zinc-800 px-8 py-3 rounded-lg hover:bg-zinc-900 hover:text-white hover:border-zinc-700 active:scale-[0.97] transition-all duration-150"
          >
            Features entdecken
          </a>
        </div>
      </div>

      {/* ── Dashboard mockup ──────────────────────────────── */}
      <div
        className="relative w-full max-w-3xl mx-auto pb-28 animate-fade-up"
        style={{ animationDelay: "420ms" }}
      >
        {/* Ambient glow underneath the card */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-stone-500/15 blur-2xl rounded-full pointer-events-none" />

        <div className="animate-float">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,0,0,0.8)] backdrop-blur-sm">

            {/* Window chrome */}
            <div className="bg-zinc-900/90 border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-1.5 bg-zinc-800 rounded-full w-36" />
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-14 bg-zinc-800 rounded-md" />
                <div className="h-5 w-5 bg-zinc-800 rounded-md" />
              </div>
            </div>

            {/* Body */}
            <div className="p-5 grid grid-cols-12 gap-4">

              {/* Sidebar — hidden on mobile */}
              <div className="hidden sm:flex col-span-3 flex-col gap-2 border-r border-zinc-800/60 pr-4">
                <div className="h-2 bg-zinc-700/50 rounded-full w-3/4 mb-3" />
                <div className="h-7 bg-zinc-800 rounded-lg" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-7 bg-zinc-800/40 rounded-lg" />
                ))}
                <div className="mt-4 h-px bg-zinc-800" />
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-7 bg-zinc-800/30 rounded-lg" />
                ))}
              </div>

              {/* Main content */}
              <div className="col-span-12 sm:col-span-9 flex flex-col gap-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-2 bg-zinc-700/50 rounded-full w-28" />
                  <div className="flex gap-1.5">
                    <div className="h-5 w-16 bg-zinc-800 rounded-md" />
                    <div className="h-5 w-5 bg-zinc-800 rounded-md" />
                  </div>
                </div>

                {previewItems.map(({ status, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 bg-zinc-800/35 border border-zinc-800/50 rounded-xl px-3 py-2.5"
                  >
                    <StatusDot status={status} />
                    <span className="text-xs text-zinc-400 flex-1 truncate">{label}</span>
                    <StatusLabel status={status} />
                  </div>
                ))}

                {/* Progress bar placeholder */}
                <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-stone-500/50 rounded-full" />
                </div>
                <p className="text-[10px] text-zinc-600">3 / 5 Prüfpunkte abgeschlossen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
