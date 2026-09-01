"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import PruefrasterPoster from "./PruefrasterPoster";

// keep the WebGL code out of the initial bundle
const PruefrasterCanvas = dynamic(() => import("./PruefrasterCanvas"), { ssr: false });

export default function PruefrasterField({
  scrollRef,
  dim = false,
}: {
  scrollRef?: React.MutableRefObject<number>;
  dim?: boolean;
}) {
  const prefersReduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [degraded, setDegraded] = useState(false);
  const [shaderReady, setShaderReady] = useState(false);

  useEffect(() => {
    if (prefersReduced) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReduced]);

  const showCanvas = !prefersReduced && !degraded && inView;
  const posterVisible = !showCanvas || !shaderReady;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: posterVisible ? 1 : 0,
          transition: "opacity 700ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <PruefrasterPoster dim={dim} />
      </div>

      {showCanvas && (
        <PruefrasterCanvas
          scrollRef={scrollRef}
          dim={dim}
          onReady={() => setShaderReady(true)}
          onDegrade={() => setDegraded(true)}
        />
      )}

      {/* navy vignette so hero text stays legible over the grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 90% at 50% 42%, transparent 0%, rgba(7,11,20,0.55) 68%, rgba(7,11,20,0.9) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
