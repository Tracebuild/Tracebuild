"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// ── Particle engine ────────────────────────────────────────────────────────────
const N = 800;
const SEQ = [0, 1, 2, 3, 4, 2, 1, 0];
const SA = [79, 209, 255], SB = [56, 189, 248], SC = [40, 98, 215];
type P3 = { x: number; y: number; z: number };
type Seg = { a: P3; b: P3 };

function pr(s: number) { const x = Math.sin(s) * 43758.5453; return x - Math.floor(x); }
function lp(a: number, b: number, t: number) { return a + (b - a) * t; }

function arcPts(cx: number, cy: number, r: number, a0: number, a1: number, steps: number): P3[] {
  const pts: P3[] = [];
  for (let k = 0; k <= steps; k++) {
    const a = a0 + (a1 - a0) * (k / steps);
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), z: 0 });
  }
  return pts;
}

function distributeAlong(segs: Seg[], count: number): P3[] {
  const lens = segs.map(s => {
    const dx = s.b.x - s.a.x, dy = s.b.y - s.a.y, dz = s.b.z - s.a.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;
  });
  const totalLen = lens.reduce((a, b) => a + b, 0);
  const pts: P3[] = [];
  for (let idx = 0; idx < count; idx++) {
    const targetLen = (idx / count) * totalLen;
    let acc = 0, point: P3 = { x: 0, y: 0, z: 0 };
    for (let i = 0; i < segs.length; i++) {
      const len = lens[i];
      if (acc + len >= targetLen || i === segs.length - 1) {
        const t = Math.min(1, Math.max(0, len > 0 ? (targetLen - acc) / len : 0));
        const s = segs[i];
        point = { x: s.a.x + (s.b.x - s.a.x) * t, y: s.a.y + (s.b.y - s.a.y) * t, z: s.a.z + (s.b.z - s.a.z) * t };
        break;
      }
      acc += len;
    }
    pts.push(point);
  }
  return pts;
}

function buildShapes(): P3[][] {
  const ring: P3[] = [];

  // wireframe cube
  const cs = 0.62;
  const cn: P3[] = [
    {x:-cs,y:-cs,z:-cs},{x:cs,y:-cs,z:-cs},{x:cs,y:cs,z:-cs},{x:-cs,y:cs,z:-cs},
    {x:-cs,y:-cs,z:cs},{x:cs,y:-cs,z:cs},{x:cs,y:cs,z:cs},{x:-cs,y:cs,z:cs},
  ];
  const cubeEdges: Seg[] = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]
    .map(([a,b]) => ({a:cn[a],b:cn[b]}));

  // wireframe padlock/shield
  const shieldSegs: Seg[] = [];
  const toSegs = (pts: P3[]) => { for (let k = 0; k < pts.length - 1; k++) shieldSegs.push({ a: pts[k], b: pts[k + 1] }); };

  const outerR = 0.44, innerR = 0.27, arcCenterY = -0.34, legBottomY = -0.02;
  const outerArc = arcPts(0, arcCenterY, outerR, Math.PI, Math.PI * 2, 24);
  const innerArc = arcPts(0, arcCenterY, innerR, Math.PI, Math.PI * 2, 24);
  const shacklePts: P3[] = [
    { x: -outerR, y: legBottomY, z: 0 }, { x: -outerR, y: arcCenterY, z: 0 },
    ...outerArc.slice(1),
    { x: outerR, y: legBottomY, z: 0 }, { x: innerR, y: legBottomY, z: 0 }, { x: innerR, y: arcCenterY, z: 0 },
    ...[...innerArc].reverse().slice(1),
    { x: -innerR, y: legBottomY, z: 0 }, { x: -outerR, y: legBottomY, z: 0 },
  ];
  toSegs(shacklePts);

  const bodyLeft = -0.6, bodyRight = 0.6, bodyTop = legBottomY, bodyBottom = 0.74;
  toSegs([
    { x: bodyLeft, y: bodyTop, z: 0 }, { x: bodyRight, y: bodyTop, z: 0 },
    { x: bodyRight, y: bodyBottom, z: 0 }, { x: bodyLeft, y: bodyBottom, z: 0 }, { x: bodyLeft, y: bodyTop, z: 0 },
  ]);

  const khCx = 0, khCy = 0.28, khR = 0.1;
  toSegs(arcPts(khCx, khCy, khR, 0, Math.PI * 2, 20));
  shieldSegs.push({ a: { x: khCx + khR * 0.5, y: khCy + khR * 0.866, z: 0 }, b: { x: 0, y: 0.52, z: 0 } });
  shieldSegs.push({ a: { x: khCx - khR * 0.5, y: khCy + khR * 0.866, z: 0 }, b: { x: 0, y: 0.52, z: 0 } });

  // blueprint grid plane
  const gridLines: Seg[] = [];
  const glExt = 0.85;
  for (let k = 0; k < 9; k++) {
    const v = -glExt + 2*glExt*(k/8);
    gridLines.push({a:{x:-glExt,y:v,z:0},b:{x:glExt,y:v,z:0}});
    gridLines.push({a:{x:v,y:-glExt,z:0},b:{x:v,y:glExt,z:0}});
  }

  // radar: concentric rings + 8 spokes
  const radarSegs: Seg[] = [];
  [.28,.5,.72,.92].forEach(rad => {
    for (let k = 0; k < 24; k++) {
      const a1=(k/24)*Math.PI*2, a2=((k+1)/24)*Math.PI*2;
      radarSegs.push({a:{x:Math.cos(a1)*rad,y:Math.sin(a1)*rad*.9,z:0},b:{x:Math.cos(a2)*rad,y:Math.sin(a2)*rad*.9,z:0}});
    }
  });
  for (let k = 0; k < 8; k++) {
    const ang=(k/8)*Math.PI*2;
    radarSegs.push({a:{x:0,y:0,z:0},b:{x:Math.cos(ang)*.92,y:Math.sin(ang)*.92*.9,z:0}});
  }

  const grid = distributeAlong(gridLines, N);
  const cube = distributeAlong(cubeEdges, N);
  const radar = distributeAlong(radarSegs, N);
  const shield = distributeAlong(shieldSegs, N);

  for (let i = 0; i < N; i++) {
    const a = pr(i*5.3)*Math.PI*2, r = .66+pr(i*7.1)*.36;
    ring.push({x:Math.cos(a)*r, y:Math.sin(a)*r*.88, z:(pr(i*2.2)-.5)*.12});
  }
  const tight = (arr: P3[]) => arr.map(p => ({x:p.x*.82,y:p.y*.82,z:p.z*.82}));
  return [tight(ring), tight(grid), tight(cube), tight(radar), tight(shield)];
}

// Crossfade weight for the section at `idx`, given the current (eased, held) stage
// position. Adjacent sections' weights always sum to 1, so one fades out exactly as
// the next fades in — a continuous handover instead of independent per-section fades.
function sectionOpacity(stageF: number, idx: number): number {
  const d = Math.abs(stageF - idx);
  return d >= 1 ? 0 : 1 - d;
}

function computeStageProgress(refs: React.RefObject<HTMLElement | HTMLDivElement | null>[]): number {
  const centers = refs.map(ref => {
    const el = ref.current as HTMLElement | null;
    if (!el) return 0;
    return el.getBoundingClientRect().top + window.scrollY + el.offsetHeight / 2 - window.innerHeight / 2;
  });
  const y = window.scrollY, n = centers.length;
  if (n === 0) return 0;
  if (y <= centers[0]) return 0;
  if (y >= centers[n - 1]) return n - 1;
  const hold = 0.48;
  for (let i = 0; i < n - 1; i++) {
    if (y >= centers[i] && y <= centers[i + 1]) {
      const span = centers[i + 1] - centers[i];
      let t = span > 0 ? (y - centers[i]) / span : 0;
      if (t < hold) t = 0;
      else if (t > 1 - hold) t = 1;
      else t = (t - hold) / (1 - 2 * hold);
      t = t * t * t * (t * (t * 6 - 15) + 10);
      return i + t;
    }
  }
  return n - 1;
}

// ── Decorative network canvases ────────────────────────────────────────────────
type NetOpts = { count: number; linkDist: number; linkAlpha: number; checkmark?: boolean; orbit?: boolean };
type NetParticle = { x: number; y: number; r: number; vx?: number; vy?: number; tx?: number; ty?: number; angle?: number; speed?: number; amp?: number; jx?: number; jy?: number };

function setupNetwork(canvasEl: HTMLCanvasElement | null, opts: NetOpts): () => void {
  if (!canvasEl) return () => {};
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return () => {};
  const COLOR = "32,164,243";
  let w = 0, h = 0, frame = 0, raf = 0, particles: NetParticle[] = [];

  const checkPoints = (n: number) => {
    const cx = w / 2, cy = h / 2, s = Math.min(w, h) * 0.28;
    const pts: { x: number; y: number }[] = [];
    const legA = { x1: -0.55, y1: 0.05, x2: -0.1, y2: 0.5 };
    const legB = { x1: -0.1, y1: 0.5, x2: 0.65, y2: -0.45 };
    const nA = Math.floor(n * 0.38), nB = n - nA;
    for (let i = 0; i < nA; i++) { const t = i / (nA - 1); pts.push({ x: cx + (legA.x1 + (legA.x2 - legA.x1) * t) * s, y: cy + (legA.y1 + (legA.y2 - legA.y1) * t) * s }); }
    for (let i = 0; i < nB; i++) { const t = i / (nB - 1); pts.push({ x: cx + (legB.x1 + (legB.x2 - legB.x1) * t) * s, y: cy + (legB.y1 + (legB.y2 - legB.y1) * t) * s }); }
    return pts;
  };

  const build = () => {
    frame = 0;
    if (opts.orbit) {
      particles = checkPoints(opts.count).map(t => ({ x: t.x, y: t.y, tx: t.x, ty: t.y, r: Math.random()*1.4+0.7, angle: Math.random()*Math.PI*2, speed: 0.006+Math.random()*0.01, amp: 6+Math.random()*10 }));
    } else if (opts.checkmark) {
      particles = checkPoints(opts.count).map(t => ({ x: Math.random()*w, y: Math.random()*h, tx: t.x, ty: t.y, r: Math.random()*1.4+0.7, jx: (Math.random()-0.5)*0.4, jy: (Math.random()-0.5)*0.4 }));
    } else {
      particles = Array.from({ length: opts.count }, () => ({ x: Math.random()*w, y: Math.random()*h, vx: (Math.random()-0.5)*0.35, vy: (Math.random()-0.5)*0.35, r: Math.random()*1.6+0.6 }));
    }
  };

  const resize = () => {
    const parent = canvasEl.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    w = canvasEl.width = Math.max(1, Math.round(rect.width));
    h = canvasEl.height = Math.max(1, Math.round(rect.height));
    build();
  };

  const draw = () => {
    raf = requestAnimationFrame(draw);
    frame++;
    ctx.clearRect(0, 0, w, h);
    const settle = opts.checkmark ? Math.min(frame / 90, 1) : 1;
    for (const p of particles) {
      if (opts.orbit) {
        p.angle = (p.angle ?? 0) + (p.speed ?? 0);
        p.x = (p.tx ?? 0) + Math.cos(p.angle) * (p.amp ?? 0);
        p.y = (p.ty ?? 0) + Math.sin(p.angle * 1.3) * (p.amp ?? 0);
      } else if (opts.checkmark) {
        p.x += ((p.tx ?? 0) - p.x) * 0.04 * settle + (p.jx ?? 0) * (1 - settle);
        p.y += ((p.ty ?? 0) - p.y) * 0.04 * settle + (p.jy ?? 0) * (1 - settle);
      } else {
        p.x += p.vx ?? 0; p.y += p.vy ?? 0;
        if (p.x < 0 || p.x > w) p.vx = (p.vx ?? 0) * -1;
        if (p.y < 0 || p.y > h) p.vy = (p.vy ?? 0) * -1;
      }
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y, dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < opts.linkDist) {
          ctx.strokeStyle = `rgba(${COLOR},${((1 - dist/opts.linkDist) * opts.linkAlpha * settle).toFixed(2)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR},0.85)`;
      ctx.shadowColor = `rgba(${COLOR},0.9)`;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  resize();
  window.addEventListener("resize", resize);
  draw();
  return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
}

type LockDot = { t: number; speed: number };
type LockLine = { sx: number; sy: number; bx: number; by: number; ex: number; ey: number; dots: LockDot[]; nodeR: number };

function setupLockNetwork(canvasEl: HTMLCanvasElement | null): () => void {
  if (!canvasEl) return () => {};
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return () => {};
  const COLOR = "56,180,248";
  let w = 0, h = 0, cx = 0, cy = 0, raf = 0, t0 = 0, lines: LockLine[] = [];

  const buildLines = () => {
    const n = 40;
    lines = [];
    const ringR = Math.min(w, h) * 0.17;
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
      const curve = (Math.random() - 0.5) * 0.9;
      const startR = ringR + Math.random() * 10;
      const midR = startR + 60 + Math.random() * 100;
      const len = Math.max(w, h) * 0.6 + Math.random() * 200;
      const endR = midR + len;
      const sx = cx + Math.cos(angle) * startR, sy = cy + Math.sin(angle) * startR;
      const midAngle = angle + curve * 0.25;
      const bx = cx + Math.cos(midAngle) * midR, by = cy + Math.sin(midAngle) * midR;
      const endAngle = angle + curve * 0.5;
      const ex = cx + Math.cos(endAngle) * endR, ey = cy + Math.sin(endAngle) * endR;
      lines.push({ sx, sy, bx, by, ex, ey, dots: [{ t: Math.random(), speed: 0.0004 + Math.random() * 0.0006 }], nodeR: 2 + Math.random() * 2.5 });
    }
  };

  const resize = () => {
    const parent = canvasEl.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    w = canvasEl.width = Math.max(1, Math.round(rect.width));
    h = canvasEl.height = Math.max(1, Math.round(rect.height));
    cx = w / 2; cy = h / 2;
    buildLines();
  };

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const pointOn = (l: LockLine, t: number) => {
    const t1 = lerp(l.sx, l.bx, t), t2 = lerp(l.bx, l.ex, t);
    const y1 = lerp(l.sy, l.by, t), y2 = lerp(l.by, l.ey, t);
    return { x: lerp(t1, t2, t), y: lerp(y1, y2, t) };
  };

  const draw = () => {
    raf = requestAnimationFrame(draw);
    t0++;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = `rgba(${COLOR},0.25)`;
    for (const l of lines) {
      ctx.beginPath();
      ctx.moveTo(l.sx, l.sy);
      ctx.quadraticCurveTo(l.bx, l.by, l.ex, l.ey);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(l.bx, l.by, l.nodeR * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR},0.4)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(l.ex, l.ey, l.nodeR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${COLOR},0.5)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      for (const d of l.dots) {
        d.t += d.speed;
        if (d.t > 1) d.t = 0;
        const p = pointOn(l, d.t);
        const fade = Math.sin(d.t * Math.PI);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COLOR},${(0.4 + fade * 0.6).toFixed(2)})`;
        ctx.shadowColor = `rgba(${COLOR},0.9)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    const ringR = Math.min(w, h) * 0.17;
    const pulse = 0.65 + Math.sin(t0 * 0.008) * 0.08;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${COLOR},${pulse.toFixed(2)})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = `rgba(${COLOR},0.8)`;
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR * 0.82, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${COLOR},0.35)`;
    ctx.lineWidth = 1;
    ctx.stroke();
    const s = ringR * 0.62;
    const bw = s, bh = s * 0.8, bTop = cy - s * 0.02, bLeft = cx - bw / 2;
    ctx.save();
    ctx.strokeStyle = `rgba(${COLOR},${pulse.toFixed(2)})`;
    ctx.lineWidth = 1.6;
    ctx.shadowColor = `rgba(${COLOR},0.9)`;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(cx, bTop - s * 0.05, s * 0.4, Math.PI, 0, false);
    ctx.stroke();
    ctx.strokeRect(bLeft, bTop, bw, bh);
    ctx.beginPath();
    ctx.arc(cx, bTop + bh * 0.42, 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${COLOR},${pulse.toFixed(2)})`;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, bTop + bh * 0.48);
    ctx.lineTo(cx, bTop + bh * 0.72);
    ctx.stroke();
    ctx.restore();
  };

  resize();
  window.addEventListener("resize", resize);
  draw();
  return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef    = useRef<HTMLElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const problemNetRef  = useRef<HTMLCanvasElement>(null);
  const solutionNetRef = useRef<HTMLCanvasElement>(null);
  const gapNetRef       = useRef<HTMLCanvasElement>(null);
  const trustNetRef     = useRef<HTMLCanvasElement>(null);
  const stageRef      = useRef(0);
  const heroRef     = useRef<HTMLElement>(null);
  const problemRef  = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);
  const dashRef     = useRef<HTMLDivElement>(null);
  const trustRef    = useRef<HTMLElement>(null);
  const pricingRef  = useRef<HTMLElement>(null);
  const teamRef     = useRef<HTMLElement>(null);
  const ctaRef      = useRef<HTMLElement>(null);
  const footerRef   = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMobileMenuOpen(false);
    };
    const onResize = () => { if (window.innerWidth > 768) setMobileMenuOpen(false); };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
      window.removeEventListener("resize", onResize);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const shapes = buildShapes();
    const cur: P3[] = Array.from({ length: N }, () => ({ x: (Math.random()-.5)*.05, y: (Math.random()-.5)*.05, z: (Math.random()-.5)*.05 }));
    let raf: number, skip = 0;
    const t0 = performance.now();

    const resize = () => {
      canvas.width  = Math.min(window.innerWidth,  1600);
      canvas.height = Math.min(window.innerHeight, 900);
      ctx.setTransform(1,0,0,1,0,0);
    };
    resize();
    window.addEventListener("resize", resize);

    const sectionRefs = [heroRef, problemRef, solutionRef, dashRef, trustRef, pricingRef, teamRef, ctaRef];
    const sectionBlur = [10, 8, 8, 6, 6, 7, 7, 8];
    const applySectionFades = (stageF: number) => {
      sectionRefs.forEach((ref, idx) => {
        const el = ref.current as HTMLElement | null;
        if (!el) return;
        const op = sectionOpacity(stageF, idx);
        el.style.opacity = op.toFixed(2);
        el.style.filter  = `blur(${((1 - op) * sectionBlur[idx]).toFixed(1)}px)`;
      });
    };
    const onScroll = () => {
      stageRef.current = computeStageProgress(sectionRefs);
      setScrolled(window.scrollY > 12);
    };
    onScroll();
    applySectionFades(stageRef.current);
    window.addEventListener("scroll", onScroll, { passive: true });

    const stops = SEQ.length - 1;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      skip = (skip + 1) % 2;
      if (skip !== 0) return;
      const stageF = stageRef.current;
      applySectionFades(stageF);
      try {
        const w = canvas.width, h = canvas.height, time = (now - t0) / 1000;
        ctx.clearRect(0,0,w,h);
        const isPureRingHold = stageF === 0 || stageF === stops;
        const frac = stops > 0 ? stageF / stops : 0;
        const stage = Math.min(stops-1, Math.floor(stageF));
        const lt = Math.max(0, Math.min(1, stageF - stage));
        const sA = shapes[SEQ[stage]], sB = shapes[SEQ[stage+1]];
        const kick = Math.sin(lt * Math.PI);
        const rotY = frac * Math.PI * 3.2 + kick * 1.1;
        const tiltX = 0.22 + kick * 0.22;
        const cosR = Math.cos(rotY), sinR = Math.sin(rotY);
        const cosT = Math.cos(tiltX), sinT = Math.sin(tiltX);
        const cx = w/2, cy = h/2, sc = Math.min(w,h)*.62*(1+kick*.22);
        for (let i = 0; i < N; i++) {
          const a = sA[i], b = sB[i], c = cur[i];
          c.x += (lp(a.x,b.x,lt)-c.x)*.06; c.y += (lp(a.y,b.y,lt)-c.y)*.06; c.z += (lp(a.z,b.z,lt)-c.z)*.06;
          let dx=c.x, dy=c.y;
          const dz=c.z;
          if (stage === 1) {
            const rzAng = Math.PI * 80 / 180;
            const rcz = Math.cos(rzAng), rsz = Math.sin(rzAng);
            const ndx = dx*rcz - dy*rsz, ndy = dx*rsz + dy*rcz;
            dx = ndx; dy = ndy;
          }
          let rx=dx*cosR+dz*sinR, rz=-dx*sinR+dz*cosR;
          let ry=dy*cosT-rz*sinT; rz=dy*sinT+rz*cosT;
          const psp = Math.min(5, Math.max(.2, 2.6/Math.max(.4, 2.6+rz)));
          const sx=cx+rx*sc*psp, sy=cy+ry*sc*psp, sz=Math.max(.5, Math.min(4.5, 1.25*psp));
          if (!Number.isFinite(sx)||!Number.isFinite(sy)||!Number.isFinite(sz)) continue;
          const tw = .7+.3*Math.sin(time*2.4+i*.37);
          const op = Math.max(.3, Math.min(1, (.6+(psp-.75)*1.6+kick*.35)*tw));
          const ct = Math.max(0, Math.min(1,(c.y+1)/2));
          const from=ct<.5?SA:SB, to=ct<.5?SB:SC, lct=ct<.5?ct/.5:(ct-.5)/.5;
          const r=Math.round(lp(from[0],to[0],lct)), g=Math.round(lp(from[1],to[1],lct)), bc=Math.round(lp(from[2],to[2],lct));
          ctx.fillStyle=`rgba(${Math.min(255,r+40)},${Math.min(255,g+40)},${Math.min(255,bc+40)},${op.toFixed(2)})`;
          if (isPureRingHold) ctx.fillRect(sx-sz*.9, sy-sz*.9, sz*1.8, sz*1.8);
        }
      } catch { /* ignore */ }
    };
    raf = requestAnimationFrame(loop);

    const cleanupNet1 = setupNetwork(problemNetRef.current, { count: 90, linkDist: 140, linkAlpha: 0.35 });
    const cleanupNet2 = setupNetwork(solutionNetRef.current, { count: 70, linkDist: 90, linkAlpha: 0.4 });
    const cleanupNet3 = setupNetwork(gapNetRef.current, { count: 70, linkDist: 55, linkAlpha: 0.45, checkmark: true, orbit: true });
    const cleanupNet4 = setupLockNetwork(trustNetRef.current);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",resize);
      window.removeEventListener("scroll",onScroll);
      cleanupNet1(); cleanupNet2(); cleanupNet3(); cleanupNet4();
    };
  }, []);

  const navS: React.CSSProperties = {
    margin: "0 auto", marginTop: scrolled?10:14,
    height: scrolled?54:64, maxWidth: scrolled?620:1160,
    width: "calc(100% - 32px)", borderRadius: scrolled?999:16,
    background: scrolled?"rgba(10,10,12,0.75)":"rgba(10,10,12,0.5)",
    backdropFilter: "blur(5px) saturate(107%)", WebkitBackdropFilter: "blur(5px) saturate(107%)",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.035), inset 0 1px 0 rgba(255,255,255,0.04)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: scrolled?"0 18px":"0 24px",
    transition: "all 0.45s cubic-bezier(.4,0,.2,1)",
  };

  const netCanvasStyle: React.CSSProperties = {
    position:"absolute", inset:"-8% -6%", width:"112%", height:"116%", zIndex:0, pointerEvents:"none", display:"block",
    maskImage:"linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%)",
    WebkitMaskImage:"linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%)",
  };

  const glassCardStyle: React.CSSProperties = {
    maxWidth:640, margin:"0 auto", textAlign:"center", position:"relative", zIndex:1,
    background:"rgba(255,255,255,.03)", backdropFilter:"blur(4.5px) saturate(107%)", WebkitBackdropFilter:"blur(4.5px) saturate(107%)",
    border:"1px solid rgba(255,255,255,.1)", borderRadius:20, padding:"48px 40px",
    transition:"opacity .2s cubic-bezier(.4,0,.2,1), filter .2s cubic-bezier(.4,0,.2,1)",
  };

  return (
    <>
      <style>{`
        body { margin:0; overflow-x:hidden; background:linear-gradient(150deg,#0a1a24 0%,#0a1420 45%,#070b14 100%) fixed; }
        .lp-nav-link { font-size:12.5px; letter-spacing:.04em; text-transform:uppercase; color:#9a9ba3; font-weight:500; text-decoration:none; transition:color .2s; }
        .lp-nav-link:hover { color:#fff; }
        .lp-nav-login { font-size:12.5px; letter-spacing:.03em; text-transform:uppercase; color:#fff; background:rgba(20,20,24,.55); border:1px solid rgba(255,255,255,.09); border-radius:9px; padding:8px 16px; font-weight:500; text-decoration:none; transition:border-color .2s, background .2s; }
        .lp-nav-login:hover { border-color:#2862D7; background:rgba(91,139,247,.14); }
        .lp-btn-grad { background:linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7); color:#fff; padding:15px 28px; border-radius:10px; font-size:13.5px; font-weight:600; display:inline-flex; align-items:center; gap:6px; text-decoration:none; transition:filter .2s; }
        .lp-btn-grad:hover { filter:brightness(1.15); }
        .lp-btn-outline { color:#fff; background:rgba(20,20,24,.5); border:1px solid rgba(255,255,255,.09); padding:15px 28px; border-radius:10px; font-size:13.5px; font-weight:500; text-decoration:none; transition:border-color .2s; }
        .lp-btn-outline:hover { border-color:rgba(255,255,255,.35); }
        .lp-price-btn-outline { display:block; text-align:center; padding:12px; border-radius:9px; border:1px solid rgba(255,255,255,.16); color:#fff; font-size:12.5px; letter-spacing:.03em; text-transform:uppercase; font-weight:500; text-decoration:none; transition:border-color .2s; }
        .lp-price-btn-outline:hover { border-color:rgba(255,255,255,.4); }
        .lp-price-btn-grad { display:block; text-align:center; padding:12px; border-radius:9px; background:linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7); color:#fff; font-size:12.5px; letter-spacing:.03em; text-transform:uppercase; font-weight:600; text-decoration:none; transition:filter .2s; }
        .lp-price-btn-grad:hover { filter:brightness(1.15); }
        .lp-cta-btn { display:inline-flex; align-items:center; gap:6px; background:linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7); color:#fff; padding:16px 34px; border-radius:10px; font-size:13.5px; font-weight:600; text-decoration:none; transition:filter .2s; }
        .lp-cta-btn:hover { filter:brightness(1.15); }
        .lp-talk-btn { display:inline-flex; align-items:center; gap:8px; background:linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7); color:#fff; padding:13px 24px; border-radius:10px; font-size:12.5px; letter-spacing:.03em; text-transform:uppercase; font-weight:600; text-decoration:none; transition:filter .2s; margin-top:34px; }
        .lp-talk-btn:hover { filter:brightness(1.15); }
        .lp-footer-link { font-size:13.5px; color:#9a9ba3; text-decoration:none; transition:color .2s; }
        .lp-footer-link:hover { color:#fff; }
        @keyframes glowPulse { 0%,100%{opacity:.16;transform:scale(1)} 50%{opacity:.28;transform:scale(1.1)} }

        /* Mobile hamburger: hidden on desktop, shown + wired to a real menu on mobile */
        .lp-hamburger { display:none; width:36px; height:36px; align-items:center; justify-content:center; border-radius:9px; background:rgba(20,20,24,.55); border:1px solid rgba(255,255,255,.09); cursor:pointer; flex-shrink:0; transition:border-color .2s, background .2s; }
        .lp-hamburger:hover { border-color:#2862D7; background:rgba(91,139,247,.14); }
        .lp-mobile-menu { display:none; }
        .lp-mobile-link { display:block; padding:14px 18px; font-size:14px; font-weight:500; color:#e4e5ea; text-decoration:none; border-radius:10px; transition:background .15s, color .15s; }
        .lp-mobile-link:hover { background:rgba(255,255,255,.06); color:#fff; }

        /* Mobile: quick-nav collapses into a hamburger menu; login stays desktop/laptop only */
        @media (max-width: 768px) {
          .lp-nav-links, .lp-desktop-only { display:none !important; }
          .lp-hamburger { display:flex; }
          .lp-mobile-menu {
            display:flex; flex-direction:column; gap:2px;
            width:calc(100% - 32px); max-width:420px; margin-top:8px; padding:8px;
            background:rgba(10,10,12,.92); backdrop-filter:blur(10px) saturate(107%); -webkit-backdrop-filter:blur(10px) saturate(107%);
            border:1px solid rgba(255,255,255,.09); border-radius:16px;
            box-shadow:0 20px 40px -12px rgba(0,0,0,.6);
            max-height:0; opacity:0; overflow:hidden; pointer-events:none;
            transition:max-height .3s cubic-bezier(.4,0,.2,1), opacity .2s ease, padding .3s ease;
          }
          .lp-mobile-menu-open { max-height:280px; opacity:1; pointer-events:auto; padding:8px; }
          .lp-dash { grid-template-columns: 1fr !important; aspect-ratio: auto !important; }
          .lp-dash-sidebar, .lp-dash-main { border-right:none !important; border-bottom:1px solid rgba(255,255,255,.08) !important; }
          .lp-dash-plan { min-height: 220px !important; }
          .lp-pricing-grid, .lp-kontakt-grid { grid-template-columns: 1fr !important; }
          .lp-spacer { height: 40vh !important; }
          .lp-glass-card { padding: 28px 20px !important; }
          .lp-trust-section { min-height: 90vh !important; }
        }
      `}</style>

      <div style={{ background:"transparent", color:"#fff", position:"relative", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,system-ui,'Segoe UI',sans-serif", WebkitFontSmoothing:"antialiased" }}>

        {/* Ambient blobs */}
        <div style={{ position:"fixed", top:"-12%", left:"-14%", width:"55vw", height:"55vw", maxWidth:800, maxHeight:800, background:"radial-gradient(circle,#4fd1ff 0%,transparent 70%)", filter:"blur(70px)", opacity:.16, zIndex:-1, pointerEvents:"none", animation:"glowPulse 11s ease-in-out infinite" }} />
        <div style={{ position:"fixed", top:"22%", right:"-16%", width:"50vw", height:"50vw", maxWidth:700, maxHeight:700, background:"radial-gradient(circle,#38bdf8 0%,transparent 70%)", filter:"blur(80px)", opacity:.15, zIndex:-1, pointerEvents:"none", animation:"glowPulse 14s ease-in-out infinite", animationDelay:"-4s" }} />
        <div style={{ position:"fixed", bottom:"-16%", left:"8%", width:"60vw", height:"60vw", maxWidth:850, maxHeight:850, background:"radial-gradient(circle,#2862D7 0%,transparent 70%)", filter:"blur(80px)", opacity:.17, zIndex:-1, pointerEvents:"none", animation:"glowPulse 17s ease-in-out infinite", animationDelay:"-8s" }} />

        {/* Particle canvas */}
        <canvas ref={canvasRef} style={{ position:"fixed", inset:0, width:"100vw", height:"100vh", zIndex:0, pointerEvents:"none", display:"block" }} />

        {/* NAV */}
        <header ref={headerRef} style={{ position:"fixed", top:0, left:0, right:0, zIndex:90, display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div style={navS}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <Image src="/Logo-new.png" alt="TraceBuild" width={533} height={400} style={{ height:30, width:"auto", objectFit:"contain", display:"block" }} priority />
              <span style={{ fontSize:15, fontWeight:500, letterSpacing:"-0.01em" }}>
                Trace<span style={{ background:"linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7)", WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent" }}>Build</span>
              </span>
            </div>
            <nav className="lp-nav-links" style={{ display:"flex", alignItems:"center", gap:32 }}>
              <a href="#story"   className="lp-nav-link">Produkt</a>
              <a href="#preise"  className="lp-nav-link">Preise</a>
              <a href="#kontakt" className="lp-nav-link">Kontakt</a>
            </nav>
            <a href="/login" className="lp-nav-login lp-desktop-only">Login</a>
            <button
              className="lp-hamburger"
              aria-label={mobileMenuOpen ? "Menü schliessen" : "Menü öffnen"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(v => !v)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                {mobileMenuOpen ? (
                  <path d="M3 3L13 13M13 3L3 13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                ) : (
                  <path d="M2.5 4.5H13.5M2.5 8H13.5M2.5 11.5H13.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>

          <nav className={`lp-mobile-menu ${mobileMenuOpen ? "lp-mobile-menu-open" : ""}`} aria-hidden={!mobileMenuOpen}>
            <a href="#story"   className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>Produkt</a>
            <a href="#preise"  className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>Preise</a>
            <a href="#kontakt" className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>Kontakt</a>
          </nav>
        </header>

        {/* HERO */}
        <section ref={heroRef} style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"120px 24px 40px", zIndex:1, transition:"opacity .2s cubic-bezier(.4,0,.2,1), filter .2s cubic-bezier(.4,0,.2,1)" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"7px 16px", borderRadius:999, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.12)", fontSize:12, color:"#c7c8d1", fontWeight:500, marginBottom:32 }}>
            KI-gestützte Planprüfung
          </div>
          <h1 style={{ fontSize:"clamp(34px,6.4vw,88px)", fontWeight:600, color:"#fff", lineHeight:1.08, letterSpacing:"-0.03em", margin:"0 0 22px", textWrap:"pretty" } as React.CSSProperties}>
            Baupläne <span style={{ background:"linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7)", WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent" }}>prüfen.</span><br />
            Normen einhalten.
          </h1>
          <p style={{ fontSize:17, color:"#9a9ba3", maxWidth:480, lineHeight:1.6, margin:"0 auto 36px" }}>
            TraceBuild liest technische Zeichnungen, gleicht sie mit geltenden Normen ab und liefert einen lückenlosen Prüfbericht.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:12 }}>
            <a href="#preise"  className="lp-btn-grad">Preise ansehen <span>→</span></a>
            <a href="#story"   className="lp-btn-outline">Wie es funktioniert</a>
          </div>
        </section>

        <div className="lp-spacer" style={{ height:"120vh" }} />

        {/* PROBLEM */}
        <section style={{ position:"relative", padding:"60px 24px 180px", zIndex:1, overflow:"hidden" }}>
          <canvas ref={problemNetRef} style={netCanvasStyle} />
          <div ref={problemRef} className="lp-glass-card" style={glassCardStyle}>
            <p style={{ fontSize:12, color:"#c69bf0", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, margin:"0 0 20px" }}>Wir kennen das Problem</p>
            <h2 style={{ fontSize:"clamp(26px,3.6vw,38px)", fontWeight:600, color:"#fff", lineHeight:1.3, letterSpacing:"-0.015em", margin:"0 0 22px", textWrap:"pretty" } as React.CSSProperties}>Planprüfung von Hand kostet Zeit, die im Projekt niemand übrig hat.</h2>
            <p style={{ fontSize:16, color:"#9a9ba3", lineHeight:1.75, margin:0, textWrap:"pretty" } as React.CSSProperties}>Jede Zeichnung gegen SIA-Normen, kantonale Vorschriften und interne Richtlinien abzugleichen, ist mühsam und fehleranfällig. Ein übersehener Normverstoss wird oft erst auf der Baustelle sichtbar — wenn eine Korrektur am teuersten ist.</p>
          </div>
        </section>

        <div className="lp-spacer" style={{ height:"120vh", position:"relative", overflow:"hidden" }}>
          <canvas ref={gapNetRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", zIndex:0, pointerEvents:"none", display:"block", maskImage:"linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%)", WebkitMaskImage:"linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%)" }} />
        </div>

        {/* SOLUTION */}
        <section id="story" style={{ position:"relative", padding:"60px 24px 220px", zIndex:1, overflow:"hidden" }}>
          <canvas ref={solutionNetRef} style={netCanvasStyle} />
          <div ref={solutionRef} className="lp-glass-card" style={glassCardStyle}>
            <p style={{ fontSize:12, color:"#8fb3f5", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, margin:"0 0 20px" }}>Unsere Lösung</p>
            <h2 style={{ fontSize:"clamp(26px,3.6vw,38px)", fontWeight:600, color:"#fff", lineHeight:1.3, letterSpacing:"-0.015em", margin:"0 0 22px", textWrap:"pretty" } as React.CSSProperties}>TraceBuild übernimmt den Abgleich — du prüfst nur noch das Ergebnis.</h2>
            <p style={{ fontSize:16, color:"#9a9ba3", lineHeight:1.75, margin:0, textWrap:"pretty" } as React.CSSProperties}>Zeichnung hochladen, TraceBuild liest Masse, Bauteile und Beschriftungen automatisch aus und gleicht sie in Minuten mit SIA-Normen und kantonalen Vorschriften ab. Jeder Fund ist auf den Millimeter genau im Plan verortet und mit Norm-Referenz belegt — bereit für den Prüfbericht, nicht für eine weitere Nachkontrolle.</p>
          </div>
        </section>

        {/* DASHBOARD MOCKUP */}
        <section style={{ position:"relative", padding:"0 24px 200px", zIndex:1, display:"flex", justifyContent:"center" }}>
          <div ref={dashRef} style={{ transition:"opacity .2s cubic-bezier(.4,0,.2,1), filter .2s cubic-bezier(.4,0,.2,1)" }}>
            <div className="lp-dash" style={{ width:"100%", maxWidth:787, aspectRatio:"1536/1024", background:"rgba(14,17,27,.85)", backdropFilter:"blur(9px) saturate(125%)", WebkitBackdropFilter:"blur(9px) saturate(125%)", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, boxShadow:"0 60px 120px -30px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.07)", overflow:"hidden", display:"grid", gridTemplateColumns:"190px 1fr 280px", fontSize:12 }}>

              {/* Sidebar */}
              <div className="lp-dash-sidebar" style={{ background:"rgba(255,255,255,.03)", borderRight:"1px solid rgba(255,255,255,.08)", padding:"18px 14px", display:"flex", flexDirection:"column", gap:4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:16 }}>
                  <Image src="/Logo-new.png" alt="" width={533} height={400} style={{ height:16, width:"auto", objectFit:"contain" }} />
                  <span style={{ fontSize:12, color:"#fff" }}>TraceBuild</span>
                </div>
                <div style={{ background:"linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7)", color:"#0B0C0E", borderRadius:6, padding:"8px 10px", fontSize:10.5, fontWeight:600, marginBottom:10 }}>+ Neue Analyse</div>
                <div style={{ padding:"7px 8px", borderRadius:6, fontSize:10.5, color:"#7B8299" }}>Übersicht</div>
                <div style={{ padding:"7px 8px", borderRadius:6, fontSize:10.5, color:"#7B8299" }}>Projekte</div>
                <div style={{ padding:"7px 8px", borderRadius:6, fontSize:10.5, background:"rgba(91,139,247,.12)", color:"#8fb3f5" }}>Plananalysen</div>
                <div style={{ padding:"7px 8px", borderRadius:6, fontSize:10.5, color:"#7B8299" }}>Berichte</div>
                <div style={{ padding:"7px 8px", borderRadius:6, fontSize:10.5, color:"#7B8299" }}>Normen &amp; Regeln</div>
              </div>

              {/* Main plan view */}
              <div className="lp-dash-main" style={{ borderRight:"1px solid rgba(255,255,255,.08)", display:"flex", flexDirection:"column" }}>
                <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:12.5, color:"#fff", fontWeight:500 }}>Grundriss_EG.pdf</div>
                    <div style={{ fontSize:9, color:"#6B7086", marginTop:2 }}>Hochgeladen · 10:32</div>
                  </div>
                  <div style={{ background:"linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7)", color:"#0B0C0E", borderRadius:6, padding:"6px 12px", fontSize:10, fontWeight:600 }}>Bericht erstellen</div>
                </div>
                <div className="lp-dash-plan" style={{ flex:1, position:"relative", padding:16 }}>
                  <svg viewBox="0 0 380 250" style={{ width:"100%", height:"100%", display:"block" }}>
                    <rect x="10" y="10" width="360" height="230" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1" />
                    <rect x="170" y="10"  width="4" height="100" fill="rgba(255,255,255,.3)" />
                    <rect x="170" y="140" width="4" height="100" fill="rgba(255,255,255,.3)" />
                    <rect x="10"  y="128" width="100" height="4" fill="rgba(255,255,255,.3)" />
                    <rect x="142" y="128" width="228" height="4" fill="rgba(255,255,255,.3)" />
                    <rect x="250" y="128" width="4"   height="112" fill="rgba(255,255,255,.3)" />
                    <text x="35"  y="70"  fill="rgba(255,255,255,.45)" fontSize="10">Zimmer 1</text>
                    <text x="195" y="70"  fill="rgba(255,255,255,.45)" fontSize="10">Zimmer 2</text>
                    <text x="35"  y="190" fill="rgba(255,255,255,.45)" fontSize="10">Wohnen / Essen</text>
                    <text x="280" y="190" fill="rgba(255,255,255,.45)" fontSize="9">Bad</text>
                    <circle cx="60"  cy="90"  r="7" fill="#ef4444" />
                    <circle cx="190" cy="115" r="7" fill="#f59e0b" />
                    <circle cx="270" cy="150" r="7" fill="#f59e0b" />
                  </svg>
                </div>
              </div>

              {/* Analysis panel */}
              <div style={{ background:"rgba(255,255,255,.03)", padding:16, display:"flex", flexDirection:"column", gap:12, overflow:"hidden" }}>
                <div style={{ fontSize:11, color:"#fff", fontWeight:500 }}>Analyseübersicht</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  <div style={{ background:"rgba(239,68,68,.1)", borderRadius:6, padding:8 }}>
                    <div style={{ fontSize:15, fontWeight:600, color:"#f87171" }}>4</div>
                    <div style={{ fontSize:8.5, color:"#7B8299" }}>Kritisch</div>
                  </div>
                  <div style={{ background:"rgba(245,158,11,.1)", borderRadius:6, padding:8 }}>
                    <div style={{ fontSize:15, fontWeight:600, color:"#fbbf24" }}>7</div>
                    <div style={{ fontSize:8.5, color:"#7B8299" }}>Hinweise</div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(91,139,247,.08)", borderRadius:8, padding:10 }}>
                  <svg viewBox="0 0 36 36" style={{ width:38, height:38, flexShrink:0 }}>
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#2862D7" strokeWidth="3" strokeDasharray="94.2" strokeDashoffset="26.4" transform="rotate(-90 18 18)" />
                  </svg>
                  <div>
                    <div style={{ fontSize:13, color:"#fff", fontWeight:600 }}>72%</div>
                    <div style={{ fontSize:8.5, color:"#7B8299" }}>geprüft</div>
                  </div>
                </div>
                <div style={{ fontSize:10, color:"#7B8299", marginTop:2 }}>Auffälligkeiten</div>
                {[
                  { title:"Wanddicke unterschritten", sev:"Kritisch", sevC:"#f87171", note:"Aussenwand · 18 statt 24 cm" },
                  { title:"Türabstand zu gering",     sev:"Hinweis",  sevC:"#fbbf24", note:"Bad · 8 statt 15 cm" },
                  { title:"Öffnung in tragender Wand",sev:"Empfehlung",sevC:"#8fb3f5",note:"Küche · Nachweis fehlt" },
                ].map(({ title, sev, sevC, note }) => (
                  <div key={title} style={{ display:"flex", flexDirection:"column", gap:1, background:"rgba(91,139,247,.06)", borderRadius:6, padding:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:10, color:"#fff" }}>{title}</span>
                      <span style={{ fontSize:8, color:sevC }}>{sev}</span>
                    </div>
                    <span style={{ fontSize:8.5, color:"#6B7086" }}>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="lp-spacer" style={{ height:"120vh" }} />

        {/* TRUST STRIP */}
        <section ref={trustRef} className="lp-trust-section" style={{ position:"relative", padding:"60px 24px", minHeight:"110vh", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1, transition:"opacity .2s cubic-bezier(.4,0,.2,1), filter .2s cubic-bezier(.4,0,.2,1)", overflow:"hidden" }}>
          <canvas ref={trustNetRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", zIndex:0, pointerEvents:"none", display:"block", maskImage:"linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%)", WebkitMaskImage:"linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%)" }} />
          <div style={{ maxWidth:880, margin:"0 auto", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"14px 40px", background:"rgba(255,255,255,.03)", backdropFilter:"blur(4.5px)", WebkitBackdropFilter:"blur(4.5px)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:"26px 32px", position:"relative", zIndex:1 }}>
            {["Daten bleiben in der Schweiz","Revisionssicher dokumentiert","Laufend aktualisierte Normdatenbank","Feste Ansprechperson"].map(t => (
              <span key={t} style={{ fontSize:13, color:"#c7c8d1" }}>{t}</span>
            ))}
          </div>
        </section>

        <div className="lp-spacer" style={{ height:"120vh" }} />

        {/* PRICING */}
        <section id="preise" ref={pricingRef} style={{ position:"relative", padding:"60px 24px 220px", zIndex:1, transition:"opacity .2s cubic-bezier(.4,0,.2,1), filter .2s cubic-bezier(.4,0,.2,1)" }}>
          <div style={{ maxWidth:1080, margin:"0 auto" }}>
            <p style={{ fontSize:12, color:"#c69bf0", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, margin:"0 0 20px", textAlign:"center" }}>Preise</p>
            <h2 style={{ fontSize:"clamp(28px,4vw,46px)", fontWeight:600, color:"#fff", lineHeight:1.2, letterSpacing:"-0.02em", margin:"0 0 16px", textAlign:"center" }}>Pakete, die du verstehst.</h2>
            <p style={{ fontSize:16, color:"#9a9ba3", textAlign:"center", maxWidth:460, margin:"0 auto 56px", lineHeight:1.6 }}>Ein klares Abo, alle Kernfunktionen inklusive.</p>

            <div className="lp-pricing-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:16 }}>
              {/* Starter */}
              <div style={{ background:"rgba(255,255,255,.03)", backdropFilter:"blur(4.5px)", WebkitBackdropFilter:"blur(4.5px)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:18, padding:"36px 30px" }}>
                <p style={{ fontSize:12.5, color:"#9a9ba3", fontWeight:600, letterSpacing:".04em", margin:"0 0 18px", textTransform:"uppercase" }}>Starter</p>
                <p style={{ fontSize:34, fontWeight:600, color:"#fff", margin:"0 0 4px", letterSpacing:"-0.02em" }}>CHF 149<span style={{ fontSize:13, color:"rgba(117,118,128,.5)", fontWeight:400 }}> /Monat</span></p>
                <p style={{ fontSize:13, color:"rgba(117,118,128,.5)", margin:"0 0 28px" }}>Für einzelne Büros</p>
                <div style={{ display:"flex", flexDirection:"column", gap:11, margin:"0 0 32px" }}>
                  {["Bis 30 Pläne / Monat","SIA-Normabgleich","PDF-Prüfberichte"].map(f => <span key={f} style={{ fontSize:13.5, color:"#c7c8d1" }}>{f}</span>)}
                </div>
                <a href="#kontakt" className="lp-price-btn-outline">Anfragen</a>
              </div>

              {/* Team */}
              <div style={{ position:"relative", background:"rgba(40,98,215,.08)", backdropFilter:"blur(4.5px)", WebkitBackdropFilter:"blur(4.5px)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.04)", border:"1px solid rgba(91,139,247,.35)", borderRadius:18, padding:"36px 30px" }}>
                <span style={{ position:"absolute", top:0, left:24, right:24, height:2, background:"linear-gradient(90deg,#4fd1ff,#2862D7)", borderRadius:2 }} />
                <p style={{ fontSize:12.5, color:"#8fb3f5", fontWeight:600, letterSpacing:".04em", margin:"0 0 18px", textTransform:"uppercase" }}>Team · Beliebt</p>
                <p style={{ fontSize:34, fontWeight:600, color:"#fff", margin:"0 0 4px", letterSpacing:"-0.02em" }}>CHF 349<span style={{ fontSize:13, color:"#9a9ba3", fontWeight:400 }}> /Monat</span></p>
                <p style={{ fontSize:13, color:"#9a9ba3", margin:"0 0 28px" }}>Für wachsende Büros</p>
                <div style={{ display:"flex", flexDirection:"column", gap:11, margin:"0 0 32px" }}>
                  {["Bis 150 Pläne / Monat","SIA + kantonale Normen","Bis 10 Teammitglieder","Feste Ansprechperson"].map(f => <span key={f} style={{ fontSize:13.5, color:"#eef1fb" }}>{f}</span>)}
                </div>
                <a href="#kontakt" className="lp-price-btn-grad">Anfragen</a>
              </div>

              {/* Enterprise */}
              <div style={{ background:"rgba(255,255,255,.03)", backdropFilter:"blur(4.5px)", WebkitBackdropFilter:"blur(4.5px)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:18, padding:"36px 30px" }}>
                <p style={{ fontSize:12.5, color:"#9a9ba3", fontWeight:600, letterSpacing:".04em", margin:"0 0 18px", textTransform:"uppercase" }}>Enterprise</p>
                <p style={{ fontSize:34, fontWeight:600, color:"#fff", margin:"0 0 4px", letterSpacing:"-0.02em" }}>Individuell</p>
                <p style={{ fontSize:13, color:"rgba(117,118,128,.5)", margin:"0 0 28px" }}>Für grosse Organisationen</p>
                <div style={{ display:"flex", flexDirection:"column", gap:11, margin:"0 0 32px" }}>
                  {["Unbegrenzte Pläne","BIM- & IFC-Anbindung","SLA & dedizierter Support"].map(f => <span key={f} style={{ fontSize:13.5, color:"#c7c8d1" }}>{f}</span>)}
                </div>
                <a href="#kontakt" className="lp-price-btn-outline">Kontaktieren</a>
              </div>
            </div>
          </div>
        </section>

        <div className="lp-spacer" style={{ height:"120vh" }} />

        {/* KONTAKT */}
        <section id="kontakt" ref={teamRef} style={{ position:"relative", padding:"60px 24px 200px", zIndex:1, transition:"opacity .2s cubic-bezier(.4,0,.2,1), filter .2s cubic-bezier(.4,0,.2,1)" }}>
          <div style={{ maxWidth:840, margin:"0 auto" }}>
            <div style={{ background:"rgba(255,255,255,.03)", backdropFilter:"blur(5px)", WebkitBackdropFilter:"blur(5px)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, padding:48 }}>
              <p style={{ fontSize:12, color:"#8fb3f5", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, margin:"0 0 14px" }}>Ansprechpersonen</p>
              <h2 style={{ fontSize:"clamp(22px,3vw,28px)", fontWeight:600, color:"#fff", lineHeight:1.3, letterSpacing:"-0.01em", margin:"0 0 14px" }}>Ein junges Team, das dein Projekt persönlich begleitet.</h2>
              <p style={{ fontSize:15, color:"#9a9ba3", lineHeight:1.7, margin:"0 0 34px", maxWidth:500 }}>Keine Warteschleife, kein Ticket im System. Jonas und Livio kennen jedes Projekt persönlich — von der ersten Frage bis zur laufenden Nutzung.</p>
              <div className="lp-kontakt-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:26 }}>
                {[
                  { initials:"JJ", name:"Jonas Jud",   role:"Mitgründer", email:"jonas@tracebuild.ch" },
                  { initials:"LT", name:"Livio Thoma", role:"Mitgründer", email:"livio@tracebuild.ch" },
                ].map(({ initials, name, role, email }) => (
                  <div key={name} style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <div style={{ width:64, height:64, borderRadius:14, background:"rgba(91,139,247,.1)", border:"1px solid rgba(91,139,247,.28)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:20, fontWeight:600, color:"#8fb3f5", letterSpacing:"-0.02em" }}>{initials}</span>
                    </div>
                    <div>
                      <p style={{ fontSize:15, color:"#fff", fontWeight:500, margin:"0 0 3px" }}>{name}</p>
                      <p style={{ fontSize:13, color:"#9a9ba3", margin:"0 0 8px" }}>{role}</p>
                      <a href={`mailto:${email}`} style={{ fontSize:13, color:"#2862D7", textDecoration:"none" }}>{email}</a>
                    </div>
                  </div>
                ))}
              </div>
              <a href="mailto:jonas@tracebuild.ch" className="lp-talk-btn">Gespräch vereinbaren →</a>
            </div>
          </div>
        </section>

        <div className="lp-spacer" style={{ height:"120vh" }} />

        {/* FINAL CTA */}
        <section ref={ctaRef} style={{ position:"relative", padding:"20px 24px 220px", textAlign:"center", zIndex:1, transition:"opacity .2s cubic-bezier(.4,0,.2,1), filter .2s cubic-bezier(.4,0,.2,1)" }}>
          <div style={{ maxWidth:720, margin:"0 auto" }}>
            <h2 style={{ fontSize:"clamp(32px,5.6vw,64px)", fontWeight:600, color:"#fff", lineHeight:1.1, letterSpacing:"-0.025em", margin:"0 0 24px" }}>Bereit für deine erste<br />geprüfte Zeichnung?</h2>
            <p style={{ fontSize:16, color:"#9a9ba3", lineHeight:1.65, margin:"0 0 36px" }}>Schreib uns, was du vorhast — wir melden uns meist innerhalb eines Werktags.</p>
            <a href="#kontakt" className="lp-cta-btn">Projekt starten →</a>
          </div>
        </section>

        {/* FOOTER */}
        <footer ref={footerRef} style={{ position:"relative", zIndex:1, transition:"opacity .2s cubic-bezier(.4,0,.2,1), filter .2s cubic-bezier(.4,0,.2,1)" }}>
          <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 24px" }}>
            <div style={{ borderTop:"1px solid rgba(255,255,255,.1)", padding:"32px 0", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Image src="/Logo-new.png" alt="TraceBuild" width={533} height={400} style={{ height:20, width:"auto", objectFit:"contain" }} />
                <span style={{ fontSize:13.5, color:"#9a9ba3" }}>© 2026 TraceBuild</span>
              </div>
              <div style={{ display:"flex", gap:28 }}>
                <a href="#preise"                       className="lp-footer-link">Preise</a>
                <a href="mailto:jonas@tracebuild.ch"    className="lp-footer-link">Kontakt</a>
                <a href="/login"                        className="lp-footer-link lp-desktop-only">Login</a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
