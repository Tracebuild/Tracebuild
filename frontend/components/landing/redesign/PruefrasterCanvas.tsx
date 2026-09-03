"use client";

import { useEffect, useRef } from "react";

/**
 * "Der Prüfraster" — the hero WebGL element.
 * A single fragment shader on one fullscreen triangle (no Three.js). Renders an
 * architect's setting-out field: a perspective grid of plumb + level lines
 * converging on a vanishing point, with one horizontal "sweep" passing top→bottom
 * like a plotter head. Palette colours only. Degrades to <PruefrasterPoster/>.
 */

const VERT = `#version 300 es
precision highp float;
const vec2 verts[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
void main() { gl_Position = vec4(verts[gl_VertexID], 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  uRes;
uniform float uTime;
uniform float uProgress;   // 0..1 grid draw-in from the vanishing point
uniform float uScroll;     // 0..1 hero scroll — pitches VP up, accelerates sweep
uniform float uDim;        // 0 = hero, 1 = final CTA (darker, calmer)

// palette
const vec3 BG_TOP  = vec3(0.039, 0.102, 0.141); // #0a1a24
const vec3 BG_BOT  = vec3(0.027, 0.043, 0.078); // #070b14
const vec3 GRID    = vec3(0.220, 0.741, 0.973); // #38bdf8
const vec3 NODE    = vec3(0.310, 0.820, 1.000); // #4fd1ff
const vec3 SWEEP   = vec3(0.561, 0.702, 0.961); // #8fb3f5

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float gridLine(float coord, float w) {
  float g = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  return 1.0 - min(g * w, 1.0);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag - 0.5 * uRes) / uRes.y;   // y up, centred

  // tiny domain warp so the grid breathes — never chaotic
  uv += 0.004 * vec2(sin(uv.y * 3.0 + uTime * 0.30),
                     cos(uv.x * 3.0 + uTime * 0.25));

  float vpY = 0.18 + uScroll * 0.12;        // vanishing point rises on scroll
  vec3 bg = mix(BG_BOT, BG_TOP, clamp(0.5 - uv.y, 0.0, 1.0));
  vec3 col = bg;

  // ground region below the vanishing point
  float below = vpY - uv.y;
  if (below > 0.0035) {
    float d = 1.0 / below;                  // perspective depth → ∞ at horizon
    float px = uv.x * d;

    float levels = gridLine(d * 0.55, 1.0);
    float plumbs = gridLine(px * 0.60, 1.0);
    float grid = max(levels, plumbs);
    float node = levels * plumbs;

    // fog: far lines dissolve; also fade toward screen edges
    float fog = exp(-d * 0.028);
    float edge = smoothstep(1.25, 0.35, length(uv - vec2(0.0, vpY)));
    float pres = fog * edge;

    // draw-in grows outward from the vanishing point
    float reveal = smoothstep(0.0, 1.0, uProgress * 2.2 - d * 0.16);

    float alpha = (1.0 - uScroll * 0.82) * (1.0 - uDim * 0.45);

    col += GRID * grid * pres * reveal * 0.55 * alpha;
    col += NODE * node * pres * reveal * 0.9 * alpha;

    // the sweep — one bright band, top→bottom every ~8s (faster on scroll / dim)
    float speed = 8.0 - uScroll * 4.5 - uDim * 2.0;
    float phase = fract(uTime / speed);
    float sweepY = mix(vpY - 0.02, -0.62, phase);
    float band = smoothstep(0.06, 0.0, abs(uv.y - sweepY));
    col += SWEEP * band * pres * reveal * 0.5 * alpha;
    col += NODE * node * band * pres * reveal * 2.0 * alpha; // nodes pulse as it crosses
  }

  // film grain
  float g = hash(frag + uTime * 60.0);
  col += (g - 0.5) * 0.022;

  fragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("[Prüfraster] shader error:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function PruefrasterCanvas({
  scrollRef,
  dim = false,
  onDegrade,
  onReady,
}: {
  scrollRef?: React.MutableRefObject<number>;
  dim?: boolean;
  onDegrade?: () => void;
  onReady?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const degradedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // low-end heuristic — never spin up the GPU loop on weak devices
    const nav = navigator as Navigator & { deviceMemory?: number };
    if ((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4) {
      onDegrade?.();
      return;
    }

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      onDegrade?.();
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      onDegrade?.();
      return;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      onDegrade?.();
      return;
    }
    gl.useProgram(prog);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uProgress = gl.getUniformLocation(prog, "uProgress");
    const uScroll = gl.getUniformLocation(prog, "uScroll");
    const uDim = gl.getUniformLocation(prog, "uDim");
    gl.uniform1f(uDim, dim ? 1 : 0);

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const maxDpr = isMobile ? 0.75 : 1.5;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let visible = true;
    let ready = false;
    const start = performance.now();
    let last = start;
    let slowFrames = 0;
    const FRAME_MS = 1000 / 30; // 30 fps cap
    let acc = 0;

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const stop = (degrade: boolean) => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      io.disconnect();
      if (degrade && !degradedRef.current) {
        degradedRef.current = true;
        onDegrade?.();
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      const delta = now - last;
      last = now;
      acc += delta;
      if (acc < FRAME_MS) return;
      acc = 0;

      // fps watchdog — sustained <50fps swaps to the poster for good
      if (delta > 20) slowFrames++;
      else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 45) {
        stop(true);
        return;
      }

      const t = (now - start) / 1000;
      resize();
      gl.uniform1f(uTime, t);
      gl.uniform1f(uProgress, Math.min(1, t / 1.4));
      gl.uniform1f(uScroll, scrollRef?.current ?? 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!ready && t > 0.05) {
        ready = true;
        onReady?.();
      }
    };
    raf = requestAnimationFrame(frame);

    return () => stop(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dim]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    />
  );
}
