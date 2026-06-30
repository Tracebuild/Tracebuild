import Link from "next/link";
import TraceBuildLogo from "./TraceBuildLogo";
import AnimatedBackground from "./AnimatedBackground";

/* ── Floating analysis card ──────────────────────────── */
function AnalysisCard({
  title, badge, badgeColor, rows,
}: {
  title: string;
  badge: string;
  badgeColor: "warn" | "ok" | "error";
  rows: { label: string; value: string; highlight?: boolean }[];
}) {
  const badgeCls =
    badgeColor === "ok"    ? "bg-emerald-100 text-emerald-700" :
    badgeColor === "warn"  ? "bg-amber-100 text-amber-700" :
                             "bg-red-100 text-red-700";
  const dotCls =
    badgeColor === "ok"    ? "bg-emerald-500" :
    badgeColor === "warn"  ? "bg-amber-500" :
                             "bg-red-500";

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-stone-900/[0.08] border border-stone-200/80 p-4 w-52">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotCls}`} />
        <span className="text-[10px] font-bold text-[#141414] tracking-widest uppercase">
          {title}
        </span>
      </div>
      <div className="space-y-1.5 mb-3">
        {rows.map(({ label, value, highlight }) => (
          <div key={label} className="flex justify-between items-baseline">
            <span className="text-[11px] text-stone-500">{label}</span>
            <span className={`text-[11px] font-semibold ${highlight ? "text-red-600" : "text-[#141414]"}`}>
              {value}
            </span>
          </div>
        ))}
      </div>
      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded tracking-widest uppercase ${badgeCls}`}>
        {badge}
      </span>
    </div>
  );
}

/* ── Dashboard mockup ────────────────────────────────── */
function DashboardPreview() {
  const kpis = [
    { label: "Geprüfte Pläne", value: "10.248", trend: "+18% diesen Monat", up: true },
    { label: "Gefundene Fehler", value: "342",    trend: "−12% diesen Monat", up: false },
    { label: "Warnungen",       value: "1.128",   trend: "+8% diesen Monat",  up: true },
    { label: "Normen geprüft",  value: "98.7%",   trend: "+2.1% diesen Monat", up: true },
  ];

  const checks = [
    { name: "Wohnüberbauung Seestrasse", file: "Grundriss_EG.pdf", pct: 78 },
    { name: "Bürogebäude Nord",           file: "Schnitt_A-A.pdf",  pct: 45 },
  ];

  const donutSegments = [
    { label: "Abstände",     pct: "42%", color: "#B7926A", dash: "58.06 80.17",  offset: "0" },
    { label: "Bemaßung",     pct: "28%", color: "#D4A574", dash: "38.70 99.53",  offset: "-58.06" },
    { label: "Konstruktion", pct: "18%", color: "#5C8C72", dash: "24.88 113.35", offset: "-96.76" },
    { label: "Sonstige",     pct: "12%", color: "#C8B89A", dash: "16.59 121.64", offset: "-121.64" },
  ];

  const activities = [
    { text: "Geländerhöhe unterschritten",   time: "vor 2 Min." },
    { text: "Türbreite nicht normkonform",   time: "vor 5 Min." },
    { text: "Abstand zu Wand zu gering",     time: "vor 12 Min." },
    { text: "Stahlträger nicht bemesst",     time: "vor 18 Min." },
  ];

  const navItems = ["Übersicht", "Projekte", "Prüfungen", "Berichte", "Einstellungen"];

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,0,0,0.14)] border border-stone-200/50">
      {/* Window chrome */}
      <div className="bg-stone-100 border-b border-stone-200 px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white border border-stone-200 rounded-md px-3 py-1 w-52 flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-200 flex-shrink-0" />
            <span className="text-[9px] text-stone-400 truncate">app.tracebuild.ch/dashboard</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-14 bg-stone-200/60 rounded" />
          <div className="h-5 w-5 bg-stone-200/60 rounded" />
        </div>
      </div>

      {/* Dashboard body */}
      <div className="flex" style={{ height: 420 }}>

        {/* Sidebar */}
        <div className="w-44 flex-shrink-0 bg-[#FAFAF8] border-r border-stone-100 flex flex-col p-3 gap-0.5 hidden sm:flex">
          <div className="px-2 py-3 mb-2">
            <TraceBuildLogo size="sm" light />
          </div>
          {navItems.map((item, i) => (
            <div
              key={item}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11px] font-medium ${
                i === 0
                  ? "bg-[#B7926A]/10 text-[#9E7A52]"
                  : "text-stone-500 hover:bg-stone-100"
              }`}
            >
              <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${i === 0 ? "bg-[#B7926A]/50" : "bg-stone-300/60"}`} />
              {item}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#141414]">Übersicht</h3>
            <div className="flex gap-1.5">
              <div className="h-6 w-20 bg-stone-100 rounded-lg border border-stone-200" />
              <div className="h-6 w-6 bg-stone-100 rounded-lg border border-stone-200" />
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-2.5">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="bg-stone-50 border border-stone-100 rounded-xl p-2.5">
                <p className="text-[8px] text-stone-500 mb-1 leading-tight">{kpi.label}</p>
                <p className="text-sm font-bold text-[#141414] leading-none mb-1">{kpi.value}</p>
                <p className={`text-[8px] leading-tight ${kpi.up ? "text-emerald-600" : "text-red-500"}`}>
                  {kpi.trend}
                </p>
              </div>
            ))}
          </div>

          {/* 3 columns */}
          <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">

            {/* Aktuelle Prüfungen */}
            <div className="flex flex-col gap-2 overflow-hidden">
              <p className="text-[10px] font-bold text-[#141414]">Aktuelle Prüfungen</p>
              {checks.map((c) => (
                <div key={c.name}>
                  <p className="text-[9px] font-semibold text-[#141414] truncate mb-0.5">{c.name}</p>
                  <p className="text-[8px] text-stone-400 mb-1 truncate">{c.file}</p>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#B7926A] rounded-full"
                        style={{ width: `${c.pct}%` }}
                      />
                    </div>
                    <span className="text-[8px] text-stone-500 font-mono">{c.pct}%</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[7px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                      In Prüfung
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Fehler nach Kategorie */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold text-[#141414]">Fehler nach Kategorie</p>
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 60 60" className="w-16 h-16 flex-shrink-0">
                  <circle cx="30" cy="30" r="22" fill="none" stroke="#EBE5DC" strokeWidth="9" />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.label}
                      cx="30" cy="30" r="22"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="9"
                      strokeDasharray={seg.dash}
                      strokeDashoffset={seg.offset}
                      transform="rotate(-90 30 30)"
                    />
                  ))}
                </svg>
                <div className="flex flex-col gap-1.5 flex-1">
                  {donutSegments.map((seg) => (
                    <div key={seg.label} className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-[8px] text-stone-500 flex-1">{seg.label}</span>
                      <span className="text-[8px] font-bold text-[#141414]">{seg.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Letzte Aktivitäten */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-bold text-[#141414]">Letzte Aktivitäten</p>
              {activities.map((a) => (
                <div key={a.text} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B7926A] mt-1 flex-shrink-0" />
                  <span className="text-[8px] text-stone-600 flex-1 leading-tight">{a.text}</span>
                  <span className="text-[8px] text-stone-400 flex-shrink-0 whitespace-nowrap">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Hero ────────────────────────────────────────────── */
export default function Hero() {
  return (
    <section className="relative flex flex-col items-center overflow-hidden px-6">

      {/* Animated cream-blueprint background */}
      <AnimatedBackground />

      {/* ── Floating analysis cards ───────────────────────── */}
      <div
        className="absolute left-[3%] xl:left-[6%] top-[40%] -translate-y-1/2 hidden lg:block animate-fade-up z-10"
        style={{ animationDelay: "320ms" }}
      >
        <AnalysisCard
          title="Wandstärke"
          badge="Warnung"
          badgeColor="warn"
          rows={[
            { label: "Abweichung:", value: "+15mm", highlight: false },
            { label: "Soll:",       value: "240mm" },
            { label: "Ist:",        value: "255mm" },
          ]}
        />
      </div>

      <div
        className="absolute right-[3%] xl:right-[6%] top-[30%] -translate-y-1/2 hidden lg:block animate-fade-up z-10"
        style={{ animationDelay: "400ms" }}
      >
        <AnalysisCard
          title="Norm"
          badge="OK"
          badgeColor="ok"
          rows={[
            { label: "Norm:",      value: "SIA 262:2013" },
            { label: "Prüfpunkt:", value: "Geländerhöhe" },
          ]}
        />
      </div>

      <div
        className="absolute right-[3%] xl:right-[6%] top-[58%] -translate-y-1/2 hidden lg:block animate-fade-up z-10"
        style={{ animationDelay: "480ms" }}
      >
        <AnalysisCard
          title="Abstand"
          badge="Fehler"
          badgeColor="error"
          rows={[
            { label: "Abweichung:", value: "−30mm", highlight: true },
            { label: "Soll:",       value: "≥ 1.20m" },
            { label: "Ist:",        value: "1.17m" },
          ]}
        />
      </div>

      {/* ── Hero text ─────────────────────────────────────── */}
      <div className="relative w-full max-w-4xl text-center pt-44 pb-12 z-10">

        {/* Logo badge */}
        <div
          className="inline-flex items-center gap-3 bg-white/80 border border-stone-200 rounded-full px-5 py-2 mb-10 animate-fade-up shadow-sm"
          style={{ animationDelay: "0ms" }}
        >
          <TraceBuildLogo size="sm" light />
        </div>

        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#141414] leading-[1.08] tracking-tight mb-6 animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          Baupläne prüfen.<br />
          <span className="text-[#B7926A]">Fehler finden.</span><br />
          Normen einhalten.
        </h1>

        <p
          className="text-lg text-stone-600 max-w-xl mx-auto mb-12 leading-relaxed animate-fade-up"
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
            className="group w-full sm:w-auto bg-[#B7926A] text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-[#9E7A52] active:scale-[0.97] transition-all duration-150 shadow-sm"
          >
            Jetzt starten
            <span className="inline-block ml-1.5 transition-transform duration-150 group-hover:translate-x-0.5">→</span>
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto text-sm text-stone-600 border border-stone-300 px-8 py-3 rounded-lg hover:bg-white hover:text-[#141414] hover:border-stone-400 active:scale-[0.97] transition-all duration-150"
          >
            Features entdecken
          </a>
        </div>
      </div>

      {/* ── Dashboard mockup ──────────────────────────────── */}
      <div
        className="relative w-full max-w-5xl mx-auto pb-28 animate-fade-up z-10"
        style={{ animationDelay: "420ms" }}
      >
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-[#B7926A]/10 blur-3xl rounded-full pointer-events-none" />
        <div className="animate-float">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
