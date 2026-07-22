"use client";
import { useState, useEffect, type ReactNode } from "react";

export default function HeroFade({ children }: { children: ReactNode }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const fn = () => setT(Math.min(1, window.scrollY / (window.innerHeight * 0.9)));
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div style={{
      position: "relative",
      transform: `scale(${(1 - t * 0.1).toFixed(3)}) translateY(${(t * 30).toFixed(1)}px)`,
      opacity: Math.max(0, 1 - t * 1.2),
      transition: "transform 0.05s linear, opacity 0.05s linear",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {children}
    </div>
  );
}
