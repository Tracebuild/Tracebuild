"use client";

import Link from "next/link";
import Image from "next/image";

const EASE = "cubic-bezier(.52,.01,0,1)";

export default function AuthBackButton() {
  return (
    <Link
      href="/"
      style={{
        position: "absolute", top: 24, left: 24, zIndex: 20,
        display: "flex", alignItems: "center", gap: 9,
        textDecoration: "none",
        border: "1px solid rgba(133,166,233,0.28)",
        borderRadius: 10, padding: "9px 16px",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(23,37,64,0.4)",
        transition: `all .4s ${EASE}`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "rgba(40,98,215,0.14)";
        el.style.borderColor = "rgba(133,166,233,0.5)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "rgba(23,37,64,0.4)";
        el.style.borderColor = "rgba(133,166,233,0.28)";
      }}
    >
      <Image
        src="/Logo-new.png"
        alt=""
        width={533}
        height={400}
        style={{ height: 22, width: "auto", objectFit: "contain" }}
      />
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>
        <span style={{ color: "#FFFFFF" }}>Trace</span>
        <span style={{ color: "#2862D7" }}>Build</span>
      </span>
    </Link>
  );
}
