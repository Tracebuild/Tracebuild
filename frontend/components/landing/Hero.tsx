import Link from "next/link";
import TraceBuildLogo from "./TraceBuildLogo";

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
    <section className="relative flex flex-col items-center bg-[#0D0D0F] overflow-hidden px-6">

      {/* ── Grain/noise texture ───────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.045]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <filter id="tb-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#tb-noise)" />
      </svg>

      {/* ── Animated glow blobs (brand color) ────────────── */}
      <div
        className="absolute -top-24 left-[10%] w-[560px] h-[560px] rounded-full blur-[130px] bg-[#B7926A]/10 animate-glow-drift pointer-events-none"
      />
      <div
        className="absolute top-[28%] right-[6%] w-[400px] h-[400px] rounded-full blur-[110px] bg-[#B7926A]/06 animate-glow-drift-alt pointer-events-none"
        style={{ animationDelay: "-8s" }}
      />
      <div
        className="absolute bottom-0 left-[32%] w-[480px] h-[480px] rounded-full blur-[140px] bg-[#B7926A]/08 animate-glow-drift pointer-events-none"
        style={{ animationDelay: "-5s" }}
      />

      {/* ── Subtle grid ───────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:72px_72px]" />

      {/* ── Hero text ─────────────────────────────────────── */}
      <div className="relative w-full max-w-4xl text-center pt-44 pb-16">

        {/* Logo badge */}
        <div
          className="inline-flex items-center gap-3 bg-[#161616]/80 border border-white/[0.08] rounded-full px-5 py-2 mb-10 animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          <TraceBuildLogo size="sm" />
        </div>

        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#F7F7F5] leading-[1.08] tracking-tight mb-6 animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          Baupläne prüfen.<br />
          <span className="text-[#B7926A]">Fehler finden.</span><br />
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
            className="group w-full sm:w-auto bg-[#F7F7F5] text-[#0D0D0F] px-8 py-3 rounded-lg text-sm font-semibold hover:bg-white active:scale-[0.97] transition-all duration-150"
          >
            Jetzt starten
            <span className="inline-block ml-1.5 transition-transform duration-150 group-hover:translate-x-0.5">→</span>
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto text-sm text-zinc-400 border border-white/10 px-8 py-3 rounded-lg hover:bg-[#161616] hover:text-[#F7F7F5] hover:border-[#B7926A]/30 active:scale-[0.97] transition-all duration-150"
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
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-[#B7926A]/12 blur-2xl rounded-full pointer-events-none" />

        <div className="animate-float">
          <div className="bg-[#161616]/80 border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,0,0,0.85)] backdrop-blur-sm">

            {/* Window chrome */}
            <div className="bg-[#161616] border-b border-white/[0.07] px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/10" />
                ))}
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-1.5 bg-white/[0.07] rounded-full w-36" />
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-14 bg-white/[0.06] rounded-md" />
                <div className="h-5 w-5 bg-white/[0.06] rounded-md" />
              </div>
            </div>

            {/* Body */}
            <div className="p-5 grid grid-cols-12 gap-4">

              {/* Sidebar */}
              <div className="hidden sm:flex col-span-3 flex-col gap-2 border-r border-white/[0.06] pr-4">
                <div className="h-2 bg-white/10 rounded-full w-3/4 mb-3" />
                <div className="h-7 bg-[#B7926A]/20 border border-[#B7926A]/20 rounded-lg" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-7 bg-white/[0.05] rounded-lg" />
                ))}
                <div className="mt-4 h-px bg-white/[0.06]" />
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-7 bg-white/[0.04] rounded-lg" />
                ))}
              </div>

              {/* Main */}
              <div className="col-span-12 sm:col-span-9 flex flex-col gap-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-2 bg-white/10 rounded-full w-28" />
                  <div className="flex gap-1.5">
                    <div className="h-5 w-16 bg-white/[0.06] rounded-md" />
                    <div className="h-5 w-5 bg-white/[0.06] rounded-md" />
                  </div>
                </div>

                {previewItems.map(({ status, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2.5"
                  >
                    <StatusDot status={status} />
                    <span className="text-xs text-zinc-400 flex-1 truncate">{label}</span>
                    <StatusLabel status={status} />
                  </div>
                ))}

                <div className="mt-2 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-[#B7926A]/40 rounded-full" />
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
