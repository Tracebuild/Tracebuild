"use client";

import Link from "next/link";
import Image from "next/image";

export default function AuthBackButton() {
  return (
    <Link
      href="/"
      style={{
        position: "fixed", top: 24, left: 24, zIndex: 20,
        display: "flex", alignItems: "center", gap: 9,
        textDecoration: "none",
        border: "1px solid rgba(255,255,255,.09)",
        borderRadius: 9, padding: "9px 16px",
        background: "rgba(20,20,24,.55)",
        transition: "border-color .2s, background .2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "#2862D7";
        el.style.background = "rgba(40,98,215,.14)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(255,255,255,.09)";
        el.style.background = "rgba(20,20,24,.55)";
      }}
    >
      <Image src="/Logo-new.png" alt="" width={533} height={400} style={{ height: 20, width: "auto", objectFit: "contain" }} />
      <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>
        <span style={{ color: "#fff" }}>Trace</span>
        <span style={{ background: "linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Build</span>
      </span>
    </Link>
  );
}
