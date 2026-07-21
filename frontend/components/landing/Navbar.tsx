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
        transition: "all 0.35s cubic-bezier(.16,1,.3,1)",
        ...(scrolled
          ? {
              marginTop: 12,
              height: 58,
              maxWidth: 420,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(30,25,19,0.75)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
              padding: "0 18px",
            }
          : {
              height: 80,
              maxWidth: 1080,
              padding: "0 28px",
            }
        ),
      }}>
        {/* Logo mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Image
            src="/tracebuild-logo.png"
            alt="TraceBuild"
            width={120}
            height={40}
            style={{ height: 28, width: "auto", objectFit: "contain", display: "block" }}
            priority
          />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>
            <span style={{ color: "#F5F1EA" }}>Trace</span>
            <span style={{ color: "#D9B692" }}>Build</span>
          </span>
        </div>

        <Link
          href="/login"
          className="hover:bg-white/[0.08] hover:border-white/[0.32]"
          style={{
            fontSize: 14, color: "#F5F1EA",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 8, padding: "9px 20px",
            fontWeight: 500, textDecoration: "none",
            transition: "all 0.2s ease",
          }}
        >
          Login
        </Link>
      </div>
    </header>
  );
}
