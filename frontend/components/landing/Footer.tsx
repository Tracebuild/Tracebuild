import Link from "next/link";
import TraceBuildLogo from "./TraceBuildLogo";

const productLinks = [
  { label: "Features",   href: "#features" },
  { label: "Workflow",   href: "#workflow" },
  { label: "Sicherheit", href: "#sicherheit" },
];

export default function Footer() {
  return (
    <footer className="bg-[#161616] border-t border-white/[0.07]">
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-10 mb-12">
          <div className="max-w-xs">
            <div className="mb-4">
              <TraceBuildLogo size="sm" />
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
                  className="text-sm text-zinc-400 hover:text-[#F7F7F5] transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs text-zinc-600 uppercase tracking-widest mb-1">Konto</span>
              <Link href="/login" className="text-sm text-zinc-400 hover:text-[#F7F7F5] transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} TraceBuild. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
