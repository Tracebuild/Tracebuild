"use client";
import { useState, useEffect } from "react";

export default function ScrollProgressBar() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const fn = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setW(docH > 0 ? Math.min(100, (window.scrollY / docH) * 100) : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 100, pointerEvents: "none" }}>
      <div style={{ height: "100%", width: `${w.toFixed(2)}%`, background: "#CEF79E", transition: "width 0.1s linear" }} />
    </div>
  );
}
