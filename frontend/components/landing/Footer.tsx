import Link from "next/link";
import TraceBuildLogo from "./TraceBuildLogo";

const productLinks = [
  { label: "Features",   href: "#features" },
  { label: "Workflow",   href: "#workflow" },
  { label: "Sicherheit", href: "#sicherheit" },
];

export default function Footer() {
  return (
    <footer className="bg-[#EBE5DC] border-t border-[#B7926A]/10">
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-10 mb-12">
          <div className="max-w-xs">
            <div className="mb-4">
              <TraceBuildLogo size="sm" light />
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              KI-gestützte Planprüfung für Architektur und Bauwesen im DACH-Raum.
            </p>
          </div>

          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              <span className="text-xs text-stone-400 uppercase tracking-widest mb-1 font-semibold">Produkt</span>
              {productLinks.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm text-stone-600 hover:text-[#B7926A] transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs text-stone-400 uppercase tracking-widest mb-1 font-semibold">Konto</span>
              <Link href="/login" className="text-sm text-stone-600 hover:text-[#B7926A] transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-300 pt-6">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} TraceBuild. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
