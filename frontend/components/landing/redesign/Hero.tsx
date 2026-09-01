"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import PruefrasterField from "./PruefrasterField";
import { GradientButton, GhostButton, WordReveal, Eyebrow } from "./primitives";
import { EASE_OUT } from "@/lib/landing/motion";

export default function Hero() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollRef.current = v;
  });

  const fieldOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.15]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, prefersReduced ? 0 : -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="top"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(120px, 20vh, 200px) var(--tb-gutter) 80px",
        overflow: "hidden",
      }}
    >
      <motion.div style={{ position: "absolute", inset: 0, opacity: prefersReduced ? 1 : fieldOpacity }}>
        <PruefrasterField scrollRef={scrollRef} />
      </motion.div>

      <motion.div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 1000,
          textAlign: "center",
          y: contentY,
          opacity: prefersReduced ? 1 : contentOpacity,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <Eyebrow>Für Architekturbüros in der Schweiz</Eyebrow>
        </motion.div>

        <h1
          style={{
            fontSize: "clamp(40px, 6.6vw, 104px)",
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            margin: "22px auto 0",
            maxWidth: 15 + "ch",
            textWrap: "balance" as React.CSSProperties["textWrap"],
          }}
        >
          <WordReveal text="Baueingaben, die beim ersten Mal" delay={0.15} />{" "}
          <WordReveal text="sitzen." accentWord="sitzen" delay={0.15 + 0.04 * 6} />
        </h1>

        <motion.p
          initial={{ opacity: 0, filter: prefersReduced ? "blur(0px)" : "blur(8px)", y: 20 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.55 }}
          style={{
            fontSize: "clamp(16px, 1.4vw, 20px)",
            lineHeight: 1.6,
            color: "var(--tb-text-secondary)",
            maxWidth: "var(--tb-max-prose)",
            margin: "26px auto 0",
          }}
        >
          TraceBuild prüft Ihre Eingabepläne automatisch gegen SIA-Normen und kantonales
          Baurecht — und hält jede Fundstelle nachvollziehbar fest. Dazu eine zentrale,
          laufend aktualisierte Normen-Datenbank.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.68 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
            marginTop: 34,
          }}
        >
          <GradientButton href="#kontakt">Demo anfragen →</GradientButton>
          <GhostButton href="#normen-datenbank">Normen-Datenbank ansehen</GhostButton>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.9 }}
          style={{
            fontSize: 13,
            letterSpacing: "0.01em",
            color: "var(--tb-text-tertiary)",
            marginTop: 22,
          }}
        >
          Daten in der Schweiz gehostet · DSG-konform · persönliche Ansprechperson
        </motion.p>
      </motion.div>

      {/* scroll cue */}
      {!prefersReduced && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          style={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--tb-text-tertiary)",
            }}
          >
            Scrollen
          </span>
          <span style={{ position: "relative", width: 1, height: 40, background: "var(--tb-hairline)", overflow: "hidden" }}>
            <motion.span
              animate={{ y: [-40, 40] }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
              style={{ position: "absolute", inset: 0, background: "var(--tb-accent-gradient)" }}
            />
          </span>
        </motion.div>
      )}
    </section>
  );
}
