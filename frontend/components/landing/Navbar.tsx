"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 90 }}>
      <div style={{
        margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 28,
        transition: "all 0.45s cubic-bezier(.52,.01,0,1)",
        ...(scrolled
          ? {
              marginTop: 12,
              height: 56,
              maxWidth: 760,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(15,15,16,0.6)",
              backdropFilter: "blur(24px) saturate(140%)",
              WebkitBackdropFilter: "blur(24px) saturate(140%)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
              padding: "0 20px",
            }
          : {
              marginTop: 14,
              height: 72,
              maxWidth: 1160,
              borderRadius: 14,
              background: "rgba(15,15,16,0.32)",
              backdropFilter: "blur(16px) saturate(130%)",
              WebkitBackdropFilter: "blur(16px) saturate(130%)",
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              padding: "0 26px",
            }
        ),
      }}>
        {/* Logo mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Image
            src="/tracebuild-logo.png"
            alt="TraceBuild"
            width={80}
            height={28}
            style={{ height: 26, width: "auto", objectFit: "contain", display: "block" }}
            priority
          />
          <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em" }}>
            <span style={{ color: "#F7F5F1" }}>Trace</span>
            <span style={{ color: "#CEF79E" }}>Build</span>
          </span>
        </div>

        {/* Nav links (desktop only) */}
        <nav className="hidden lg:flex" style={{ alignItems: "center", gap: 36 }}>
          {[
            { href: "#workflow",    label: "Plananalyse" },
            { href: "#sicherheit", label: "Sicherheit" },
          ].map(({ href, label }) => (
            <a key={href} href={href} style={{
              fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase",
              color: "#C9CBBE", fontWeight: 500,
              textDecoration: "none",
              transition: "color 0.3s cubic-bezier(.52,.01,0,1)",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#F7F5F1")}
            onMouseLeave={e => (e.currentTarget.style.color = "#C9CBBE")}
            >{label}</a>
          ))}
        </nav>

        <Link
          href="/login"
          style={{
            fontSize: 13, letterSpacing: "0.03em", textTransform: "uppercase",
            color: "#F7F5F1",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 6, padding: "9px 18px",
            fontWeight: 500, textDecoration: "none",
            transition: "all 0.3s cubic-bezier(.52,.01,0,1)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLElement).style.borderColor = "#CEF79E";
            (e.currentTarget as HTMLElement).style.color = "#CEF79E";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)";
            (e.currentTarget as HTMLElement).style.color = "#F7F5F1";
          }}
        >
          Login
        </Link>
      </div>
    </header>
  );
}
