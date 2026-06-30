import Link from "next/link";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Sicherheit", href: "#sicherheit" },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-zinc-950 font-bold text-xs">TB</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">TraceBuild</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        <Link
          href="/login"
          className="text-sm text-zinc-300 border border-zinc-700 rounded-lg px-4 py-2 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          Login
        </Link>
      </nav>
    </header>
  );
}
