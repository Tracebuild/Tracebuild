"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Eyebrow } from "./primitives";
import { EASE_OUT, revealUp, staggerParent, revealTextLine, inView } from "@/lib/landing/motion";

type Scatter = { x: string; y: string; rot: number };

const FRAGMENTS: { problem: string; solution: string; scatter: Scatter }[] = [
  {
    problem: "Normen ändern sich. Kantonal. Ständig.",
    solution: "Jede Fundstelle verlinkt auf die Norm.",
    scatter: { x: "-32%", y: "-24%", rot: -4 },
  },
  {
    problem: "Die Prüfung passiert im Kopf — oder gar nicht.",
    solution: "Jede Entscheidung dokumentiert.",
    scatter: { x: "26%", y: "6%", rot: 3 },
  },
  {
    problem: "Fehler fallen erst bei der Behörde auf.",
    solution: "Jede Änderung nachvollziehbar.",
    scatter: { x: "-14%", y: "30%", rot: -2 },
  },
];

function Fragment({
  progress,
  data,
  row,
}: {
  progress: MotionValue<number>;
  data: (typeof FRAGMENTS)[number];
  row: number;
}) {
  // 0 .. .32 scattered · .32 .. .55 snap to grid · .55 .. 1 solution copy
  const x = useTransform(progress, [0.12, 0.5], [data.scatter.x, "0%"]);
  const y = useTransform(progress, [0.12, 0.5], [data.scatter.y, `${(row - 1) * 88}px`]);
  const rot = useTransform(progress, [0.12, 0.5], [data.scatter.rot, 0]);
  const tick = useTransform(
    progress,
    [0.4, 0.56],
    ["var(--tb-danger-bright)", "var(--tb-accent)"]
  );
  const problemOpacity = useTransform(progress, [0.46, 0.56], [1, 0]);
  const solutionOpacity = useTransform(progress, [0.5, 0.62], [0, 1]);

  return (
    <motion.div
      style={{
        position: "absolute",
        left: 0,
        top: "50%",
        x,
        y,
        rotate: rot,
        maxWidth: 340,
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <motion.span
        style={{
          flexShrink: 0,
          marginTop: 9,
          width: 22,
          height: 2,
          borderRadius: 2,
          background: tick,
        }}
      />
      <span style={{ position: "relative", display: "block", fontSize: 17, lineHeight: 1.5 }}>
        <motion.span
          style={{ position: "absolute", inset: 0, color: "var(--tb-text-bright)", opacity: problemOpacity }}
        >
          {data.problem}
        </motion.span>
        <motion.span style={{ color: "var(--tb-text)", opacity: solutionOpacity }}>
          {data.solution}
        </motion.span>
      </span>
    </motion.div>
  );
}

export default function ProblemSolution() {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const problemHeadOpacity = useTransform(scrollYProgress, [0.4, 0.52], [1, 0]);
  const problemHeadY = useTransform(scrollYProgress, [0.4, 0.52], [0, -28]);
  const solutionHeadOpacity = useTransform(scrollYProgress, [0.5, 0.64], [0, 1]);
  const solutionHeadY = useTransform(scrollYProgress, [0.5, 0.64], [28, 0]);
  const lineScale = useTransform(scrollYProgress, [0.5, 0.98], [0, 1]);

  // Avoid a hydration mismatch: SSR + first client paint always render the
  // animated structure; reduced-motion users get one post-hydration swap to the
  // static layout (this section is below the fold, so no visible flash).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (mounted && prefersReduced) {
    return (
      <section
        ref={ref}
        style={{ position: "relative", padding: "var(--tb-section-y) var(--tb-gutter)" }}
      >
        <div style={{ maxWidth: "var(--tb-max)", margin: "0 auto", display: "grid", gap: 96 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={staggerParent()}>
            <motion.div variants={revealTextLine}>
              <Eyebrow style={{ color: "var(--tb-danger-bright)" }}>Das Problem</Eyebrow>
            </motion.div>
            <motion.h2 variants={revealUp} style={{ fontSize: "clamp(30px,4.4vw,58px)", margin: "18px 0 28px", maxWidth: 640 }}>
              Ein übersehener Grenzabstand kostet Wochen.
            </motion.h2>
            <div style={{ display: "grid", gap: 14 }}>
              {FRAGMENTS.map((f) => (
                <p key={f.problem} style={{ margin: 0, fontSize: 17, color: "var(--tb-text-bright)" }}>
                  {f.problem}
                </p>
              ))}
            </div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={inView} variants={staggerParent()}>
            <motion.div variants={revealTextLine}>
              <Eyebrow>Der Ansatz</Eyebrow>
            </motion.div>
            <motion.h2 variants={revealUp} style={{ fontSize: "clamp(30px,4.4vw,58px)", margin: "18px 0 28px", maxWidth: 640 }}>
              TraceBuild macht die Prüfung sichtbar.
            </motion.h2>
            <div style={{ display: "grid", gap: 14 }}>
              {FRAGMENTS.map((f) => (
                <p key={f.solution} style={{ margin: 0, fontSize: 17, color: "var(--tb-text)" }}>
                  {f.solution}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} style={{ position: "relative", height: "300vh" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          padding: "0 var(--tb-gutter)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "var(--tb-max)",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: "clamp(32px,6vw,96px)",
            alignItems: "center",
          }}
        >
          {/* headlines */}
          <div style={{ position: "relative", minHeight: 220 }}>
            <motion.div style={{ opacity: problemHeadOpacity, y: problemHeadY }}>
              <Eyebrow style={{ color: "var(--tb-danger-bright)" }}>Das Problem</Eyebrow>
              <h2 style={{ fontSize: "clamp(30px,4vw,58px)", marginTop: 18, maxWidth: 560 }}>
                Ein übersehener Grenzabstand kostet Wochen.
              </h2>
            </motion.div>
            <motion.div
              style={{ position: "absolute", inset: 0, opacity: solutionHeadOpacity, y: solutionHeadY }}
            >
              <Eyebrow>Der Ansatz</Eyebrow>
              <h2 style={{ fontSize: "clamp(30px,4vw,58px)", marginTop: 18, maxWidth: 560 }}>
                TraceBuild macht die Prüfung sichtbar.
              </h2>
            </motion.div>
          </div>

          {/* fragments field */}
          <div style={{ position: "relative", height: 320 }}>
            <motion.span
              style={{
                position: "absolute",
                left: -1,
                top: 0,
                width: 2,
                height: "100%",
                background: "var(--tb-accent-gradient)",
                transformOrigin: "top",
                scaleY: lineScale,
              }}
            />
            <div style={{ position: "relative", height: "100%", paddingLeft: 26 }}>
              {FRAGMENTS.map((f, i) => (
                <Fragment key={i} progress={scrollYProgress} data={f} row={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
