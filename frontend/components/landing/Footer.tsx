import Link from "next/link";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Sicherheit", href: "#sicherheit" },
];

export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-10 mb-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-zinc-950 font-bold text-xs">TB</span>
              </div>
              <span className="text-white font-semibold text-sm">TraceBuild</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              KI-gestützte Planprüfung für Architektur und Bauwesen im DACH-Raum.
            </p>
          </div>

          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              <span className="text-xs text-zinc-600 uppercase tracking-widest mb-1">Produkt</span>
              {productLinks.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs text-zinc-600 uppercase tracking-widest mb-1">Konto</span>
              <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} TraceBuild. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
