"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TraceBuildLogo from "./TraceBuildLogo";

const navLinks = [
  { label: "Features",   href: "#features" },
  { label: "Workflow",   href: "#workflow" },
  { label: "Sicherheit", href: "#sicherheit" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div
        className={`mx-auto flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? "mt-2 sm:mt-3 h-14 max-w-6xl rounded-full border border-stone-200/70 bg-white/80 backdrop-blur-xl shadow-elevated px-4 sm:px-5"
            : "h-16 max-w-6xl bg-white/90 backdrop-blur-sm border-b border-stone-200/80 px-6"
        }`}
      >
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
      </div>
    </header>
  );
}
