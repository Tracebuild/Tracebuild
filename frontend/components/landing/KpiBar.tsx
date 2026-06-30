const kpis = [
  { value: "10.000+", label: "Geprüfte Pläne" },
  { value: "99.9%", label: "Verfügbarkeit" },
  { value: "< 24h", label: "Analyse-Dauer" },
  { value: "ISO-konform", label: "Zertifiziert" },
];

export default function KpiBar() {
  return (
    <div className="bg-zinc-900 border-y border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
        {kpis.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
