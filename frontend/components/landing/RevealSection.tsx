"use client";
import { useRef, useEffect, useState, type ReactNode, type CSSProperties } from "react";

export default function RevealSection({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.8s cubic-bezier(.52,.01,0,1) ${delay}ms, transform 0.8s cubic-bezier(.52,.01,0,1) ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}
