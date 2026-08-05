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

function alongSegments(segs: Seg[], idx: number, total: number): P3 {
  const per = total / segs.length;
  const si = Math.min(segs.length - 1, Math.floor(idx / per));
  const t = (idx / per) - si;
  const s = segs[si];
  return { x: s.a.x + (s.b.x - s.a.x) * t, y: s.a.y + (s.b.y - s.a.y) * t, z: s.a.z + (s.b.z - s.a.z) * t };
}

function buildShapes(): P3[][] {
  const ring: P3[] = [], grid: P3[] = [], cube: P3[] = [], radar: P3[] = [], pyramid: P3[] = [];

  // wireframe cube
  const cs = 0.62;
  const cn: P3[] = [
    {x:-cs,y:-cs,z:-cs},{x:cs,y:-cs,z:-cs},{x:cs,y:cs,z:-cs},{x:-cs,y:cs,z:-cs},
    {x:-cs,y:-cs,z:cs},{x:cs,y:-cs,z:cs},{x:cs,y:cs,z:cs},{x:-cs,y:cs,z:cs},
  ];
  const cubeEdges: Seg[] = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]
    .map(([a,b]) => ({a:cn[a],b:cn[b]}));

  // wireframe pyramid
  const bs = 0.68;
  const base: P3[] = [{x:-bs,y:.5,z:-bs},{x:bs,y:.5,z:-bs},{x:bs,y:.5,z:bs},{x:-bs,y:.5,z:bs}];
  const apex: P3 = {x:0,y:-.62,z:0};
  const pyrEdges: Seg[] = [
    {a:base[0],b:base[1]},{a:base[1],b:base[2]},{a:base[2],b:base[3]},{a:base[3],b:base[0]},
    {a:base[0],b:apex},{a:base[1],b:apex},{a:base[2],b:apex},{a:base[3],b:apex},
  ];

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

  for (let i = 0; i < N; i++) {
    const a = pr(i*5.3)*Math.PI*2, r = .66+pr(i*7.1)*.36;
    ring.push({x:Math.cos(a)*r, y:Math.sin(a)*r*.88, z:(pr(i*2.2)-.5)*.12});
    grid.push(alongSegments(gridLines, i, N));
    cube.push(alongSegments(cubeEdges, i, N));
    radar.push(alongSegments(radarSegs, i, N));
    pyramid.push(alongSegments(pyrEdges, i, N));
  }
  const tight = (arr: P3[]) => arr.map(p => ({x:p.x*.82,y:p.y*.82,z:p.z*.82}));
  return [tight(ring), tight(grid), tight(cube), tight(radar), tight(pyramid)];
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const scrollFrac  = useRef(0);
  const heroRef     = useRef<HTMLElement>(null);
  const problemRef  = useRef<HTMLElement>(null);
  const solutionRef = useRef<HTMLElement>(null);
  const dashRef     = useRef<HTMLDivElement>(null);
  const trustRef    = useRef<HTMLElement>(null);
  const pricingRef  = useRef<HTMLElement>(null);
  const teamRef     = useRef<HTMLElement>(null);
  const ctaRef      = useRef<HTMLElement>(null);
  const footerRef   = useRef<HTMLElement>(null);

  function fade(ref: React.RefObject<HTMLElement | HTMLDivElement | null>, blur: number) {
    const el = ref.current as HTMLElement | null;
    if (!el) return;
    const { top, height } = el.getBoundingClientRect();
    const dist = Math.abs(top + height / 2 - window.innerHeight / 2);
    const plateau = window.innerHeight * 0.32, range = window.innerHeight * 0.55;
    const op = dist <= plateau ? 1 : Math.max(0, Math.min(1, 1 - (dist - plateau) / range));
    el.style.opacity = op.toFixed(2);
    el.style.filter  = `blur(${((1 - op) * blur).toFixed(1)}px)`;
  }

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

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollFrac.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setScrolled(window.scrollY > 12);
      fade(heroRef,10); fade(problemRef,8); fade(solutionRef,8); fade(dashRef,6);
      fade(trustRef,6); fade(pricingRef,7); fade(teamRef,7); fade(ctaRef,8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const stops = SEQ.length - 1;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if ((++skip % 4) !== 0) return;
      try {
        const w = canvas.width, h = canvas.height, time = (now - t0) / 1000;
        ctx.clearRect(0,0,w,h);
        const frac = scrollFrac.current, stF = frac * stops;
        const stage = Math.min(stops-1, Math.floor(stF));
        const lt = Math.max(0, Math.min(1, stF - stage));
        const sA = shapes[SEQ[stage]], sB = shapes[SEQ[stage+1]];
        const kick = Math.sin(lt * Math.PI);
        const rotY = frac * Math.PI * 3.2 + kick * 1.1;
        const tiltX = 0.22 + kick * 0.22;
        const cosR = Math.cos(rotY), sinR = Math.sin(rotY);
        const cosT = Math.cos(tiltX), sinT = Math.sin(tiltX);
        const cx = w/2, cy = h/2, sc = Math.min(w,h)*.62*(1+kick*.22);
        for (let i = 0; i < N; i++) {
          const a = sA[i], b = sB[i], c = cur[i];
          c.x += (lp(a.x,b.x,lt)-c.x)*.16; c.y += (lp(a.y,b.y,lt)-c.y)*.16; c.z += (lp(a.z,b.z,lt)-c.z)*.16;
          const dx=c.x, dy=c.y, dz=c.z;
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
          ctx.fillRect(sx-sz*.9, sy-sz*.9, sz*1.8, sz*1.8);
        }
      } catch { /* ignore */ }
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); window.removeEventListener("scroll",onScroll); };
  }, []);

  const navS: React.CSSProperties = {
    margin: "0 auto", marginTop: scrolled?10:14,
    height: scrolled?54:64, maxWidth: scrolled?620:1160,
    width: "calc(100% - 32px)", borderRadius: scrolled?999:16,
    background: scrolled?"rgba(10,10,12,0.8)":"rgba(10,10,12,0.5)",
    backdropFilter: "blur(5px) saturate(107%)", WebkitBackdropFilter: "blur(5px) saturate(107%)",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.035), inset 0 1px 0 rgba(255,255,255,0.04)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: scrolled?"0 18px":"0 24px",
    transition: "all 0.45s cubic-bezier(.4,0,.2,1)",
  };

  return (
    <>
      <style>{`
        body { margin:0; background:linear-gradient(150deg,#0a1a24 0%,#0a1420 45%,#070b14 100%) fixed; }
        .lp-nav-link { font-size:12.5px; letter-spacing:.04em; text-transform:uppercase; color:#9a9ba3; font-weight:500; text-decoration:none; transition:color .2s; }
        .lp-nav-link:hover { color:#fff; }
        .lp-nav-login { font-size:12.5px; letter-spacing:.03em; text-transform:uppercase; color:#fff; background:rgba(20,20,24,.55); border:1px solid rgba(255,255,255,.09); border-radius:9px; padding:8px 16px; font-weight:500; text-decoration:none; transition:border-color .2s, background .2s; }
        .lp-nav-login:hover { border-color:#2862D7; background:rgba(40,98,215,.14); }
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
      `}</style>

      <div style={{ background:"transparent", color:"#fff", position:"relative", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,system-ui,'Segoe UI',sans-serif", WebkitFontSmoothing:"antialiased" }}>

        {/* Ambient blobs */}
        <div style={{ position:"fixed", top:"-12%", left:"-14%", width:"55vw", height:"55vw", maxWidth:800, maxHeight:800, background:"radial-gradient(circle,#4fd1ff 0%,transparent 70%)", filter:"blur(70px)", opacity:.16, zIndex:-1, pointerEvents:"none", animation:"glowPulse 11s ease-in-out infinite" }} />
        <div style={{ position:"fixed", top:"22%", right:"-16%", width:"50vw", height:"50vw", maxWidth:700, maxHeight:700, background:"radial-gradient(circle,#38bdf8 0%,transparent 70%)", filter:"blur(80px)", opacity:.15, zIndex:-1, pointerEvents:"none", animation:"glowPulse 14s ease-in-out infinite", animationDelay:"-4s" }} />
        <div style={{ position:"fixed", bottom:"-16%", left:"8%", width:"60vw", height:"60vw", maxWidth:850, maxHeight:850, background:"radial-gradient(circle,#2862D7 0%,transparent 70%)", filter:"blur(80px)", opacity:.17, zIndex:-1, pointerEvents:"none", animation:"glowPulse 17s ease-in-out infinite", animationDelay:"-8s" }} />

        {/* Particle canvas */}
        <canvas ref={canvasRef} style={{ position:"fixed", inset:0, width:"100vw", height:"100vh", zIndex:0, pointerEvents:"none", display:"block" }} />

        {/* NAV */}
        <header style={{ position:"fixed", top:0, left:0, right:0, zIndex:90, display:"flex", justifyContent:"center" }}>
          <div style={navS}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <Image src="/Logo-new.png" alt="TraceBuild" width={533} height={400} style={{ height:30, width:"auto", objectFit:"contain", display:"block" }} priority />
              <span style={{ fontSize:15, fontWeight:500, letterSpacing:"-0.01em" }}>
                Trace<span style={{ background:"linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7)", WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent" }}>Build</span>
              </span>
            </div>
            <nav style={{ display:"flex", alignItems:"center", gap:32 }}>
              <a href="#story"   className="lp-nav-link">Produkt</a>
              <a href="#preise"  className="lp-nav-link">Preise</a>
              <a href="#kontakt" className="lp-nav-link">Kontakt</a>
            </nav>
            <a href="/login" className="lp-nav-login">Login</a>
          </div>
        </header>

        {/* HERO */}
        <section ref={heroRef} style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"120px 24px 40px", zIndex:1, transition:"opacity .15s linear, filter .15s linear" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"7px 16px", borderRadius:999, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.12)", fontSize:12, color:"#c7c8d1", fontWeight:500, marginBottom:32 }}>
            KI-gestützte Planprüfung
          </div>
          <h1 style={{ fontSize:"clamp(34px,6.4vw,88px)", fontWeight:600, color:"#fff", lineHeight:1.08, letterSpacing:"-0.03em", margin:"0 0 22px", } as React.CSSProperties}>
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

        <div style={{ height:"45vh" }} />

        {/* PROBLEM */}
        <section ref={problemRef} style={{ position:"relative", padding:"60px 24px 180px", zIndex:1, transition:"opacity .15s linear, filter .15s linear" }}>
          <div style={{ maxWidth:640, margin:"0 auto", textAlign:"center" }}>
            <p style={{ fontSize:12, color:"#c69bf0", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, margin:"0 0 20px" }}>Wir kennen das Problem</p>
            <h2 style={{ fontSize:"clamp(26px,3.6vw,38px)", fontWeight:600, color:"#fff", lineHeight:1.3, letterSpacing:"-0.015em", margin:"0 0 22px" }}>Planprüfung von Hand kostet Zeit, die im Projekt niemand übrig hat.</h2>
            <p style={{ fontSize:16, color:"#9a9ba3", lineHeight:1.75, margin:0 }}>Jede Zeichnung gegen SIA-Normen, kantonale Vorschriften und interne Richtlinien abzugleichen, ist mühsam und fehleranfällig. Ein übersehener Normverstoss wird oft erst auf der Baustelle sichtbar — wenn eine Korrektur am teuersten ist.</p>
          </div>
        </section>

        <div style={{ height:"45vh" }} />

        {/* SOLUTION */}
        <section id="story" ref={solutionRef} style={{ position:"relative", padding:"60px 24px 220px", zIndex:1, transition:"opacity .15s linear, filter .15s linear" }}>
          <div style={{ maxWidth:640, margin:"0 auto", textAlign:"center" }}>
            <p style={{ fontSize:12, color:"#8fb3f5", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, margin:"0 0 20px" }}>Unsere Lösung</p>
            <h2 style={{ fontSize:"clamp(26px,3.6vw,38px)", fontWeight:600, color:"#fff", lineHeight:1.3, letterSpacing:"-0.015em", margin:"0 0 22px" }}>TraceBuild übernimmt den Abgleich — du prüfst nur noch das Ergebnis.</h2>
            <p style={{ fontSize:16, color:"#9a9ba3", lineHeight:1.75, margin:0 }}>Zeichnung hochladen, TraceBuild liest Masse, Bauteile und Beschriftungen automatisch aus und gleicht sie in Minuten mit SIA-Normen und kantonalen Vorschriften ab. Jeder Fund ist auf den Millimeter genau im Plan verortet und mit Norm-Referenz belegt — bereit für den Prüfbericht, nicht für eine weitere Nachkontrolle.</p>
          </div>
        </section>

        <div style={{ height:"40vh" }} />

        {/* DASHBOARD MOCKUP */}
        <section style={{ position:"relative", padding:"0 24px 200px", zIndex:1, display:"flex", justifyContent:"center" }}>
          <div ref={dashRef} style={{ transition:"opacity .15s linear, filter .15s linear" }}>
            <div style={{ width:"100%", maxWidth:787, aspectRatio:"1536/1024", background:"rgba(14,17,27,.85)", backdropFilter:"blur(9px) saturate(125%)", WebkitBackdropFilter:"blur(9px) saturate(125%)", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, boxShadow:"0 60px 120px -30px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.07)", overflow:"hidden", display:"grid", gridTemplateColumns:"190px 1fr 280px", fontSize:12 }}>

              {/* Sidebar */}
              <div style={{ background:"rgba(255,255,255,.03)", borderRight:"1px solid rgba(255,255,255,.08)", padding:"18px 14px", display:"flex", flexDirection:"column", gap:4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:16 }}>
                  <Image src="/Logo-new.png" alt="" width={533} height={400} style={{ height:16, width:"auto", objectFit:"contain" }} />
                  <span style={{ fontSize:12, color:"#fff" }}>TraceBuild</span>
                </div>
                <div style={{ background:"linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7)", color:"#0B0C0E", borderRadius:6, padding:"8px 10px", fontSize:10.5, fontWeight:600, marginBottom:10 }}>+ Neue Analyse</div>
                {["Übersicht","Projekte","Berichte","Normen & Regeln"].map(item => (
                  <div key={item} style={{ padding:"7px 8px", borderRadius:6, fontSize:10.5, color:"#7B8299" }}>{item}</div>
                ))}
                <div style={{ padding:"7px 8px", borderRadius:6, fontSize:10.5, background:"rgba(91,139,247,.12)", color:"#8fb3f5" }}>Plananalysen</div>
              </div>

              {/* Main plan view */}
              <div style={{ borderRight:"1px solid rgba(255,255,255,.08)", display:"flex", flexDirection:"column" }}>
                <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:12.5, color:"#fff", fontWeight:500 }}>Grundriss_EG.pdf</div>
                    <div style={{ fontSize:9, color:"#6B7086", marginTop:2 }}>Hochgeladen · 10:32</div>
                  </div>
                  <div style={{ background:"linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7)", color:"#0B0C0E", borderRadius:6, padding:"6px 12px", fontSize:10, fontWeight:600 }}>Bericht erstellen</div>
                </div>
                <div style={{ flex:1, position:"relative", padding:16 }}>
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

        <div style={{ height:"40vh" }} />

        {/* TRUST STRIP */}
        <section ref={trustRef} style={{ position:"relative", padding:"0 24px 220px", zIndex:1, transition:"opacity .15s linear, filter .15s linear" }}>
          <div style={{ maxWidth:880, margin:"0 auto", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"14px 40px", background:"rgba(255,255,255,.03)", backdropFilter:"blur(4.5px)", WebkitBackdropFilter:"blur(4.5px)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:"26px 32px" }}>
            {["Daten bleiben in der Schweiz","Revisionssicher dokumentiert","Laufend aktualisierte Normdatenbank","Feste Ansprechperson"].map(t => (
              <span key={t} style={{ fontSize:13, color:"#c7c8d1" }}>{t}</span>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="preise" ref={pricingRef} style={{ position:"relative", padding:"0 24px 220px", zIndex:1, transition:"opacity .15s linear, filter .15s linear" }}>
          <div style={{ maxWidth:1080, margin:"0 auto" }}>
            <p style={{ fontSize:12, color:"#c69bf0", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, margin:"0 0 20px", textAlign:"center" }}>Preise</p>
            <h2 style={{ fontSize:"clamp(28px,4vw,46px)", fontWeight:600, color:"#fff", lineHeight:1.2, letterSpacing:"-0.02em", margin:"0 0 16px", textAlign:"center" }}>Pakete, die du verstehst.</h2>
            <p style={{ fontSize:16, color:"#9a9ba3", textAlign:"center", maxWidth:460, margin:"0 auto 56px", lineHeight:1.6 }}>Ein klares Abo, alle Kernfunktionen inklusive.</p>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:16 }}>
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

        {/* KONTAKT */}
        <section id="kontakt" ref={teamRef} style={{ position:"relative", padding:"0 24px 200px", zIndex:1, transition:"opacity .15s linear, filter .15s linear" }}>
          <div style={{ maxWidth:840, margin:"0 auto" }}>
            <div style={{ background:"rgba(255,255,255,.03)", backdropFilter:"blur(5px)", WebkitBackdropFilter:"blur(5px)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, padding:48 }}>
              <p style={{ fontSize:12, color:"#8fb3f5", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, margin:"0 0 14px" }}>Ansprechpersonen</p>
              <h2 style={{ fontSize:"clamp(22px,3vw,28px)", fontWeight:600, color:"#fff", lineHeight:1.3, letterSpacing:"-0.01em", margin:"0 0 14px" }}>Ein junges Team, das dein Projekt persönlich begleitet.</h2>
              <p style={{ fontSize:15, color:"#9a9ba3", lineHeight:1.7, margin:"0 0 34px", maxWidth:500 }}>Keine Warteschleife, kein Ticket im System. Jonas und Livio kennen jedes Projekt persönlich — von der ersten Frage bis zur laufenden Nutzung.</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:26 }}>
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

        {/* FINAL CTA */}
        <section ref={ctaRef} style={{ position:"relative", padding:"20px 24px 220px", textAlign:"center", zIndex:1, transition:"opacity .15s linear, filter .15s linear" }}>
          <div style={{ maxWidth:720, margin:"0 auto" }}>
            <h2 style={{ fontSize:"clamp(32px,5.6vw,64px)", fontWeight:600, color:"#fff", lineHeight:1.1, letterSpacing:"-0.025em", margin:"0 0 24px" }}>Bereit für deine erste<br />geprüfte Zeichnung?</h2>
            <p style={{ fontSize:16, color:"#9a9ba3", lineHeight:1.65, margin:"0 0 36px" }}>Schreib uns, was du vorhast — wir melden uns meist innerhalb eines Werktags.</p>
            <a href="#kontakt" className="lp-cta-btn">Projekt starten →</a>
          </div>
        </section>

        {/* FOOTER */}
        <footer ref={footerRef} style={{ position:"relative", zIndex:1, transition:"opacity .15s linear, filter .15s linear" }}>
          <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 24px" }}>
            <div style={{ borderTop:"1px solid rgba(255,255,255,.1)", padding:"32px 0", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Image src="/Logo-new.png" alt="TraceBuild" width={533} height={400} style={{ height:20, width:"auto", objectFit:"contain" }} />
                <span style={{ fontSize:13.5, color:"#9a9ba3" }}>© 2026 TraceBuild</span>
              </div>
              <div style={{ display:"flex", gap:28 }}>
                <a href="#preise"                       className="lp-footer-link">Preise</a>
                <a href="mailto:jonas@tracebuild.ch"    className="lp-footer-link">Kontakt</a>
                <a href="/login"                        className="lp-footer-link">Login</a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
