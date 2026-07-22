"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const EASE = "cubic-bezier(.52,.01,0,1)";

const NAV_LINKS = [
  { href: "#story",   label: "Produkt"  },
  { href: "#preise",  label: "Preise"   },
  { href: "#kontakt", label: "Kontakt"  },
];

function smoothTo(hash: string) {
  const el = document.querySelector(hash);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 90 }}>
      <div style={{
        margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 24,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        transition: `background .5s ${EASE}, box-shadow .5s ${EASE}, height .5s ${EASE}, max-width .5s ${EASE}, border-radius .5s ${EASE}, padding .5s ${EASE}, margin-top .5s ${EASE}`,
        ...(scrolled ? {
          marginTop: 12, height: 56, maxWidth: 820,
          borderRadius: 14,
          boxShadow: "inset 0 0 0 1px rgba(245,243,238,0.14)",
          background: "rgba(255,255,255,0.06)",
          padding: "0 20px",
        } : {
          marginTop: 14, height: 72, maxWidth: 1160,
          borderRadius: 14,
          boxShadow: "inset 0 0 0 1px rgba(245,243,238,0.06)",
          background: "rgba(255,255,255,0.03)",
          padding: "0 26px",
        }),
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Image
            src="/tracebuild-logo.png"
            alt="TraceBuild"
            width={80} height={28}
            style={{ height: 38, width: "auto", objectFit: "contain", display: "block" }}
            priority
          />
          <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em", color: "#F5F3EE" }}>
            Trace<span style={{ color: "#CEF79E" }}>Build</span>
          </span>
        </div>

        {/* Nav links (desktop) */}
        <nav className="hidden lg:flex" style={{ alignItems: "center", gap: 36 }}>
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={e => { e.preventDefault(); smoothTo(href); }}
              style={{ fontSize: 13, letterSpacing: "0.02em", textTransform: "uppercase", color: "#9A9D96", fontWeight: 500, textDecoration: "none", transition: `color .5s ${EASE}` }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5F3EE")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9A9D96")}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Login */}
        <Link
          href="/login"
          style={{
            fontSize: 13, letterSpacing: "0.02em", textTransform: "uppercase",
            color: "#F5F3EE",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(245,243,238,0.16)",
            borderRadius: 10, padding: "9px 18px",
            fontWeight: 500, textDecoration: "none",
            transition: `all .5s ${EASE}`,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "#CEF79E";
            el.style.color = "#CEF79E";
            el.style.background = "rgba(206,247,158,0.08)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "rgba(245,243,238,0.16)";
            el.style.color = "#F5F3EE";
            el.style.background = "rgba(255,255,255,0.05)";
          }}
        >
          Login
        </Link>
      </div>
    </header>
  );
}
