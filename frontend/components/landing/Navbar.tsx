import Link from "next/link";
import TraceBuildLogo from "./TraceBuildLogo";

const navLinks = [
  { label: "Features",   href: "#features" },
  { label: "Workflow",   href: "#workflow" },
  { label: "Sicherheit", href: "#sicherheit" },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.07] bg-[#0D0D0F]/90 backdrop-blur-sm">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <TraceBuildLogo size="sm" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-zinc-400 hover:text-[#F7F7F5] transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        <Link
          href="/login"
          className="text-sm text-zinc-300 border border-white/10 rounded-lg px-4 py-2 hover:border-[#B7926A]/50 hover:text-[#F7F7F5] transition-colors"
        >
          Login
        </Link>
      </nav>
    </header>
  );
}
