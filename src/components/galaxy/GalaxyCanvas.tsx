'use client';

/**
 * The PsyID galaxy — a canvas 3D point-cloud of the personality universe.
 * One engine, configured per context:
 *   • decorative (marketing hero): interactive=false, auto-rotating, no labels, transparent
 *   • interactive (portal home):   drag to spin, wheel/pinch to zoom, tap a node to focus
 *
 * Plain 2D canvas + manual 3D projection (no WebGL) — ported from the design handoff.
 * Honors prefers-reduced-motion (freezes auto-rotation). Drive layout from the data
 * model (see model.ts), never pixel coordinates.
 */

import { useEffect, useRef } from 'react';
import type { Graph, GNode } from './model';
import { deviceTier, prefersReducedMotion } from './perf';

const CAM = 900;
const BASE = 1.04;

export type PaletteKey = 'dark' | 'warm' | 'chrome';
export type LabelMode = 'key' | 'all' | 'hover' | 'none';

interface Pal { bg: string; line: string; lineCore: string; halo: number; dot: string; label: string; ghost: string }

const PALETTES: Record<PaletteKey, Pal> = {
  dark: {
    bg: 'radial-gradient(ellipse 42% 38% at 30% 30%, rgba(58,99,240,.16) 0%, transparent 60%), radial-gradient(ellipse 46% 40% at 72% 68%, rgba(138,92,214,.16) 0%, transparent 62%), radial-gradient(ellipse 80% 80% at 50% 44%, #0c1233 0%, #070a1f 55%, #04050f 100%)',
    line: 'rgba(150,170,255,', lineCore: 'rgba(190,205,255,', halo: 0.9, dot: '#fff', label: 'rgba(233,238,255,', ghost: 'rgba(150,165,220,',
  },
  warm: {
    bg: 'radial-gradient(ellipse 82% 82% at 50% 40%, #FBF7EF 0%, #F1E9DA 60%, #E7DcC8 100%)',
    line: 'rgba(90,78,58,', lineCore: 'rgba(60,50,34,', halo: 0.34, dot: '#0E1230', label: 'rgba(40,34,26,', ghost: 'rgba(120,108,86,',
  },
  chrome: {
    bg: 'radial-gradient(ellipse 42% 38% at 28% 28%, rgba(58,99,240,.15) 0%, transparent 60%), radial-gradient(ellipse 46% 40% at 74% 70%, rgba(255,122,61,.1) 0%, transparent 62%), radial-gradient(ellipse 78% 78% at 50% 44%, #10163a 0%, #0a0e26 55%, #060814 100%)',
    line: 'rgba(150,170,255,', lineCore: 'rgba(190,205,255,', halo: 0.88, dot: '#fff', label: 'rgba(233,238,255,', ghost: 'rgba(150,165,220,',
  },
};

function hexA(hex: string, a: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  const n = parseInt(h.slice(0, 6), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}

interface EngineState {
  rotX: number; rotY: number; zoom: number; autoRot: boolean; dragging: boolean;
  lastX: number; lastY: number; velX: number; velY: number; hoverId: string | null;
  dpr: number; w: number; h: number;
  projected: { n: GNode; pr: Projected }[];
  pointer: { x: number; y: number; inside: boolean };
}
interface Projected { sx: number; sy: number; z: number; scale: number }

export interface GalaxyCanvasProps {
  graph: Graph;
  interactive?: boolean;
  palette?: PaletteKey | 'transparent';
  showLabels?: LabelMode;
  glow?: number;
  speed?: number;
  centerY?: number;   // vertical center as a fraction of height
  tiltX?: number;     // initial X tilt
  sizeK?: number;     // extra scale multiplier (marketing hero layouts)
  pentagon?: 'woven' | 'framed' | 'mark' | 'none';
  onPick?: (id: string) => void;
  focusId?: string | null;
  resetKey?: number;
  className?: string;
}

export function GalaxyCanvas({
  graph, interactive = false, palette = 'transparent', showLabels = 'none',
  glow = 1, speed = 1, centerY = 0.5, tiltX = -0.42, sizeK = 1, pentagon = 'woven',
  onPick, focusId = null, resetKey = 0, className,
}: GalaxyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  const pal: Pal = palette === 'transparent' ? PALETTES.dark : PALETTES[palette];
  const bg = palette === 'transparent' ? 'transparent' : pal.bg;

  const st = useRef<EngineState>({
    rotX: tiltX, rotY: 0.5, zoom: 1, autoRot: true, dragging: false,
    lastX: 0, lastY: 0, velX: 0, velY: 0.0016, hoverId: null,
    dpr: 1, w: 0, h: 0, projected: [], pointer: { x: -1, y: -1, inside: false },
  });

  // reset view on demand
  useEffect(() => {
    const s = st.current;
    s.rotX = tiltX; s.rotY = 0.5; s.zoom = 1; s.autoRot = !prefersReducedMotion(); s.velY = prefersReducedMotion() ? 0 : 0.0016; s.velX = 0;
  }, [resetKey, tiltX]);

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const s = st.current;
    const reduced = prefersReducedMotion();
    const tier = deviceTier();
    const frameBudget = 1000 / tier.fps;
    // Decorative (non-interactive) galaxies under reduced-motion draw a single
    // static frame — no rAF loop at all.
    const staticRender = reduced && !interactive;
    if (reduced) { s.autoRot = false; s.velY = 0; }
    let raf = 0;
    let last = 0;
    let visible = true;

    function resize() {
      const rect = wrap!.getBoundingClientRect();
      s.dpr = Math.min(tier.dprCap, window.devicePixelRatio || 1);
      s.w = rect.width; s.h = rect.height;
      canvas!.width = rect.width * s.dpr; canvas!.height = rect.height * s.dpr;
      canvas!.style.width = rect.width + 'px'; canvas!.style.height = rect.height + 'px';
      if (staticRender) draw(); // redraw the frozen frame at the new size
    }

    // Pause the animation loop while the canvas is scrolled out of view.
    const io = new IntersectionObserver(([e]) => {
      const wasHidden = !visible;
      visible = e.isIntersecting;
      if (visible && wasHidden && !staticRender) { last = 0; raf = requestAnimationFrame(frame); }
    }, { rootMargin: '120px' });
    io.observe(wrap);

    function project(p: { x: number; y: number; z: number }): Projected {
      const cY = Math.cos(s.rotY), sY = Math.sin(s.rotY);
      const x = p.x * cY - p.z * sY, zr = p.x * sY + p.z * cY, y = p.y;
      const cX = Math.cos(s.rotX), sX = Math.sin(s.rotX);
      const y2 = y * cX - zr * sX, z2 = y * sX + zr * cX;
      const f = CAM / (CAM - z2);
      const scale = BASE * s.zoom * f * (Math.min(s.w, s.h) / 620) * sizeK;
      return { sx: s.w / 2 + x * scale, sy: s.h * centerY + y2 * scale, z: z2, scale };
    }

    function hit(px: number, py: number): string | null {
      let best: string | null = null, bestD = 1e9;
      for (const { n, pr } of s.projected) {
        if (n.type === 'leaf' || n.type === 'dust' || n.r <= 0) continue;
        const depth = (pr.z + 300) / 600;
        const r = Math.max(9, n.r * pr.scale * (0.72 + depth * 0.5) + 8);
        const d = Math.hypot(px - pr.sx, py - pr.sy);
        if (d < r && d < bestD) { bestD = d; best = n.id; }
      }
      return best;
    }

    const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));

    function step() {
      if (s.autoRot && !s.dragging) { s.rotY += s.velY * speed; }
      else if (!s.dragging) {
        s.rotY += s.velY; s.rotX += s.velX;
        s.velY *= 0.94; s.velX *= 0.94;
        if (Math.abs(s.velY) < 0.00018) s.velY = 0;
        if (Math.abs(s.velX) < 0.00018) s.velX = 0;
      }
      s.rotX = Math.max(-1.15, Math.min(1.15, s.rotX));
    }

    function draw() {
      ctx!.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      ctx!.clearRect(0, 0, s.w, s.h);

      const P: Record<string, Projected> = {};
      const list: { n: GNode; pr: Projected }[] = [];
      for (const n of graph.nodes) { const pr = project(n); P[n.id] = pr; list.push({ n, pr }); }
      s.projected = list;

      const dimFocus = !!focusId;

      // pentagon frame ring
      if (pentagon === 'framed') {
        const fp = graph.pent.map(project);
        ctx!.beginPath();
        fp.forEach((p, i) => (i ? ctx!.lineTo(p.sx, p.sy) : ctx!.moveTo(p.sx, p.sy)));
        ctx!.closePath();
        ctx!.strokeStyle = 'rgba(150,170,255,0.16)'; ctx!.lineWidth = 1.1; ctx!.stroke();
        const c = P['me'];
        ctx!.strokeStyle = 'rgba(150,170,255,0.07)';
        fp.forEach((p) => { ctx!.beginPath(); ctx!.moveTo(c.sx, c.sy); ctx!.lineTo(p.sx, p.sy); ctx!.stroke(); });
      }

      // edges
      ctx!.lineCap = 'round';
      for (const e of graph.edges) {
        const a = P[e.a], b = P[e.b]; if (!a || !b) continue;
        const na = nodeById.get(e.a), nb = nodeById.get(e.b);
        const locked = !!(na?.locked || nb?.locked);
        const depth = ((a.z + b.z) / 2 + 300) / 600;
        let al = (0.05 + depth * 0.14) * e.w;
        if (locked) al *= 0.6;
        if (e.pent) al *= pentagon === 'woven' ? 2.1 : pentagon === 'mark' ? 0.5 : 1;
        if (dimFocus) al *= 0.3;
        const isCore = e.w >= 1.2;
        ctx!.strokeStyle = (isCore ? pal.lineCore : pal.line) + Math.max(0, al).toFixed(3) + ')';
        ctx!.lineWidth = isCore ? 1.15 : e.pent && pentagon === 'woven' ? 1.1 : 0.8;
        ctx!.setLineDash(locked ? [2, 4] : []);
        ctx!.beginPath(); ctx!.moveTo(a.sx, a.sy); ctx!.lineTo(b.sx, b.sy); ctx!.stroke();
      }
      ctx!.setLineDash([]);

      // nodes back→front
      const drawn = [...list].sort((u, v) => u.pr.z - v.pr.z);
      for (const { n, pr } of drawn) {
        if (n.r <= 0) continue;
        const depth = (pr.z + 300) / 600;
        const r = n.r * pr.scale * (0.72 + depth * 0.5);
        const col = n.color || '#fff';
        const isFocus = focusId === n.id;
        const isHover = s.hoverId === n.id;

        if (n.type === 'dust') {
          ctx!.globalAlpha = 0.12 + depth * 0.5;
          ctx!.fillStyle = col;
          ctx!.beginPath(); ctx!.arc(pr.sx, pr.sy, Math.max(0.5, r), 0, 7); ctx!.fill();
          ctx!.globalAlpha = 1; continue;
        }

        let alpha = 0.5 + depth * 0.5;
        if (n.locked) alpha *= 0.62;
        if (dimFocus && !isFocus) alpha *= 0.26;

        if (!n.locked && glow > 0 && n.type !== 'leaf') {
          const g = pal.halo * glow * (n.type === 'core' ? 1 : n.type === 'center' ? 1.25 : 0.7) * (dimFocus && !isFocus ? 0.25 : 1);
          const rg = ctx!.createRadialGradient(pr.sx, pr.sy, 0, pr.sx, pr.sy, r * 4.3);
          rg.addColorStop(0, hexA(col, 0.55 * g));
          rg.addColorStop(0.5, hexA(col, 0.13 * g));
          rg.addColorStop(1, hexA(col, 0));
          ctx!.fillStyle = rg; ctx!.beginPath(); ctx!.arc(pr.sx, pr.sy, r * 4.3, 0, 7); ctx!.fill();
        }

        ctx!.globalAlpha = Math.min(1, alpha);
        if (n.locked) {
          ctx!.strokeStyle = pal.ghost + '0.85)'; ctx!.setLineDash([2.5, 3]); ctx!.lineWidth = 1.4;
          ctx!.beginPath(); ctx!.arc(pr.sx, pr.sy, r, 0, 7); ctx!.stroke(); ctx!.setLineDash([]);
          const gl = Math.min(1, alpha + (isHover ? 0.55 : 0.15));
          ctx!.globalAlpha = gl; ctx!.strokeStyle = pal.ghost + '1)'; ctx!.lineWidth = 1.5;
          const pg = r * 0.5;
          ctx!.beginPath();
          ctx!.moveTo(pr.sx - pg, pr.sy); ctx!.lineTo(pr.sx + pg, pr.sy);
          ctx!.moveTo(pr.sx, pr.sy - pg); ctx!.lineTo(pr.sx, pr.sy + pg);
          ctx!.stroke();
        } else {
          ctx!.fillStyle = col; ctx!.beginPath(); ctx!.arc(pr.sx, pr.sy, r, 0, 7); ctx!.fill();
          if (n.type === 'center' || n.type === 'core' || n.latest) {
            ctx!.globalAlpha = Math.min(1, alpha) * 0.9; ctx!.fillStyle = pal.dot;
            ctx!.beginPath(); ctx!.arc(pr.sx, pr.sy, r * 0.42, 0, 7); ctx!.fill();
          }
        }

        if ((isHover && !dimFocus) || isFocus) {
          ctx!.globalAlpha = 1;
          ctx!.strokeStyle = hexA(n.locked ? '#9aa6dc' : col, 0.9); ctx!.lineWidth = 1.6;
          ctx!.beginPath(); ctx!.arc(pr.sx, pr.sy, r + 6, 0, 7); ctx!.stroke();
        }
        ctx!.globalAlpha = 1;

        // labels
        const labelable = n.type === 'core' || n.type === 'module' || n.latest;
        const wantLabel = showLabels === 'all' ? n.type !== 'leaf'
          : showLabels === 'key' ? labelable
          : showLabels === 'hover' ? (isHover || isFocus) : false;
        if (wantLabel && n.label && !(dimFocus && !isFocus)) {
          ctx!.globalAlpha = (dimFocus ? 1 : 0.55 + depth * 0.45) * (n.locked ? 0.8 : 1);
          ctx!.textAlign = 'center'; ctx!.textBaseline = 'top';
          ctx!.font = `600 ${n.type === 'core' || n.type === 'center' ? 12 : 10.5}px 'Geist Mono', monospace`;
          ctx!.fillStyle = pal.label + '0.92)';
          ctx!.fillText(n.label, pr.sx, pr.sy + r + 5);
          if (n.sub && n.type === 'core') {
            ctx!.font = "500 9px 'Geist', system-ui, sans-serif";
            ctx!.fillStyle = pal.label + '0.5)';
            ctx!.fillText(n.sub, pr.sx, pr.sy + r + 19);
          }
          ctx!.globalAlpha = 1;
        }
      }

      if (interactive && s.pointer.inside && !s.dragging) {
        s.hoverId = hit(s.pointer.x, s.pointer.y);
        wrap!.style.cursor = s.hoverId ? 'pointer' : 'grab';
      }
    }

    // ── interaction ──
    let cleanupInteract = () => {};
    if (interactive) {
      const rel = (e: PointerEvent): [number, number] => { const rect = canvas!.getBoundingClientRect(); return [e.clientX - rect.left, e.clientY - rect.top]; };
      let downXY: [number, number] | null = null;
      const onDown = (e: PointerEvent) => {
        const [x, y] = rel(e); downXY = [x, y];
        s.dragging = true; s.autoRot = false; s.lastX = x; s.lastY = y; s.velX = 0; s.velY = 0;
        wrap!.style.cursor = 'grabbing';
      };
      const onMove = (e: PointerEvent) => {
        const rect = canvas!.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        s.pointer.x = x; s.pointer.y = y; s.pointer.inside = true;
        if (!s.dragging) return;
        const dx = x - s.lastX, dy = y - s.lastY;
        s.rotY += dx * 0.006; s.rotX += dy * 0.006;
        s.velY = dx * 0.003; s.velX = dy * 0.003;
        s.lastX = x; s.lastY = y;
      };
      const onUp = (e: PointerEvent) => {
        const [x, y] = rel(e);
        const tap = downXY && Math.hypot(x - downXY[0], y - downXY[1]) < 5;
        if (s.dragging && tap) { const id = hit(x, y); if (id) onPickRef.current?.(id); }
        s.dragging = false; downXY = null;
        wrap!.style.cursor = s.hoverId ? 'pointer' : 'grab';
      };
      const onLeave = () => { s.pointer.inside = false; s.hoverId = null; if (!s.dragging) wrap!.style.cursor = 'grab'; };
      const onWheel = (e: WheelEvent) => { e.preventDefault(); s.zoom = Math.max(0.55, Math.min(2.6, s.zoom * (1 - e.deltaY * 0.0012))); };
      const touchDist = (e: TouchEvent) => Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      let pinchD = 0;
      const onTouchStart = (e: TouchEvent) => { if (e.touches.length === 2) pinchD = touchDist(e); };
      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 2) { e.preventDefault(); const d = touchDist(e); if (pinchD) s.zoom = Math.max(0.55, Math.min(2.6, s.zoom * (d / pinchD))); pinchD = d; }
      };
      canvas.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointerleave', onLeave);
      canvas.addEventListener('wheel', onWheel, { passive: false });
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchmove', onTouchMove, { passive: false });
      wrap.style.cursor = 'grab';
      cleanupInteract = () => {
        canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointerleave', onLeave);
        canvas.removeEventListener('wheel', onWheel);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
      };
    }

    function frame(now = 0) {
      // Paused while scrolled out of view — keep a light rAF heartbeat only.
      if (!visible) { raf = requestAnimationFrame(frame); return; }
      // Frame-rate budget: on low-end devices this halves per-frame work.
      if (now && last && now - last < frameBudget - 1.5) { raf = requestAnimationFrame(frame); return; }
      last = now;
      step();
      draw();
      raf = requestAnimationFrame(frame);
    }

    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrap);
    if (staticRender) draw(); else frame();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); cleanupInteract(); };
  }, [graph, pal, bg, interactive, showLabels, glow, speed, centerY, tiltX, sizeK, pentagon, focusId]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: 'absolute', inset: 0, background: bg, pointerEvents: interactive ? 'auto' : 'none' }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}

export default GalaxyCanvas;
