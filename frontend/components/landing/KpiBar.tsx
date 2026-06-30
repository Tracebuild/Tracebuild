import AnimatedSection from "./AnimatedSection";

const kpis = [
  { value: "10.000+",    label: "Geprüfte Pläne" },
  { value: "99.9%",      label: "Verfügbarkeit" },
  { value: "< 24h",      label: "Analyse-Dauer" },
  { value: "ISO-konform", label: "Zertifiziert" },
];

export default function KpiBar() {
  return (
    <div className="bg-[#EBE5DC] border-y border-[#B7926A]/[0.12]">
      <AnimatedSection className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
        {kpis.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-[#141414] mb-1.5 tracking-tight">
              {value}
            </p>
            <p className="text-xs text-stone-500 uppercase tracking-widest">{label}</p>
          </div>
        ))}
      </AnimatedSection>
    </div>
  );
}
