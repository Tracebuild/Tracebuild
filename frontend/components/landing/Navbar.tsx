import Link from "next/link";
import TraceBuildLogo from "./TraceBuildLogo";

const navLinks = [
  { label: "Features",   href: "#features" },
  { label: "Workflow",   href: "#workflow" },
  { label: "Sicherheit", href: "#sicherheit" },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-stone-200/80 bg-white/92 backdrop-blur-sm">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <TraceBuildLogo size="sm" light />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-stone-600 hover:text-[#141414] transition-colors font-medium"
            >
              {label}
            </a>
          ))}
        </div>

        <Link
          href="/login"
          className="text-sm text-stone-700 border border-stone-300 rounded-lg px-4 py-2 hover:border-[#B7926A]/70 hover:text-[#B7926A] transition-colors font-medium"
        >
          Login
        </Link>
      </nav>
    </header>
  );
}
