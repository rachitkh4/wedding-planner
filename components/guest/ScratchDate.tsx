"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { prefersReducedMotion, readFlag, REVEALED_KEY, setFlag, subscribeFlags } from "@/lib/invite-flags";

type Labels = { scratch: string; reveal: string };

/**
 * Hides the wedding date under gold foil the first time. Scratching it away
 * (or tapping "Show the date") reveals it with a burst of confetti. Seen once
 * per phone.
 */
export function ScratchDate({ labels, children }: { labels: Labels; children: React.ReactNode }) {
  // The server renders the date plainly; the foil appears only for first-time visitors, behind the envelope.
  const revealed = useSyncExternalStore(subscribeFlags, () => readFlag(REVEALED_KEY), () => true);
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef({ drawing: false, x: 0, y: 0, moves: 0, done: false });
  const [fading, setFading] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(fadeTimer.current), []);

  const reveal = useCallback(async () => {
    if (state.current.done) return;
    state.current.done = true;
    setFading(true); // keep the foil on screen while it fades away
    fadeTimer.current = setTimeout(() => setFading(false), 800);
    setFlag(REVEALED_KEY, true);
    if (prefersReducedMotion()) return;
    const { default: confetti } = await import("canvas-confetti");
    const rect = box.current?.getBoundingClientRect();
    const origin = rect
      ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight }
      : { x: 0.5, y: 0.5 };
    const colors = ["#e2a63b", "#f2c14e", "#7a1930", "#6e7b4f", "#c4455f"];
    confetti({ particleCount: 90, spread: 75, startVelocity: 38, origin, colors, zIndex: 100 });
    setTimeout(() => confetti({ particleCount: 60, spread: 110, startVelocity: 28, origin, colors, zIndex: 100 }), 220);
  }, []);

  // Paint the foil.
  useEffect(() => {
    const el = canvas.current;
    const holder = box.current;
    if (revealed || !el || !holder) return;
    state.current = { drawing: false, x: 0, y: 0, moves: 0, done: false };
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = holder.getBoundingClientRect();
    el.width = Math.round(width * dpr);
    el.height = Math.round(height * dpr);
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const foil = ctx.createLinearGradient(0, 0, el.width, el.height);
    foil.addColorStop(0, "#d99a2b");
    foil.addColorStop(0.35, "#f6d98a");
    foil.addColorStop(0.6, "#e2a63b");
    foil.addColorStop(1, "#c98a2a");
    ctx.fillStyle = foil;
    ctx.fillRect(0, 0, el.width, el.height);
    for (let i = 0; i < 90; i++) {
      // fixed pseudo-random sparkle so it looks like glittery foil
      const x = ((i * 9301 + 49297) % 233280) / 233280;
      const y = ((i * 7919 + 12345) % 233280) / 233280;
      ctx.fillStyle = i % 3 ? "rgb(255 255 255 / 0.35)" : "rgb(122 25 48 / 0.18)";
      ctx.beginPath();
      ctx.arc(x * el.width, y * el.height, (1 + (i % 3)) * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#7a1930";
    // Canvas can't use CSS variables for fonts (it would silently fall back to a tiny default), so name real fonts.
    ctx.font = `700 ${Math.round(24 * dpr)}px system-ui, "Noto Sans Devanagari", "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(labels.scratch, el.width / 2, el.height / 2);
  }, [revealed, labels.scratch]);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const el = canvas.current!;
    const rect = el.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * el.width,
      y: ((e.clientY - rect.top) / rect.height) * el.height,
    };
  }

  function scratchedFraction() {
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const { data } = ctx.getImageData(0, 0, el.width, el.height);
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 24) {
      total++;
      if (data[i] < 40) clear++;
    }
    return clear / total;
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const s = state.current;
    if (!s.drawing) return;
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const { x, y } = point(e);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineWidth = 46 * (window.devicePixelRatio || 1);
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    s.x = x;
    s.y = y;
    if (++s.moves % 8 === 0 && scratchedFraction() > 0.5) reveal();
  }

  return (
    <div>
      <div ref={box} className={`relative ${!revealed || fading ? "select-none" : ""}`}>
        {children}
        {(!revealed || fading) && (
          <canvas
            ref={canvas}
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full touch-none rounded-2xl transition-opacity duration-700 ${
              fading ? "pointer-events-none opacity-0" : ""
            }`}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              const { x, y } = point(e);
              state.current.drawing = true;
              state.current.x = x;
              state.current.y = y;
            }}
            onPointerMove={onMove}
            onPointerUp={() => (state.current.drawing = false)}
            onPointerCancel={() => (state.current.drawing = false)}
          />
        )}
      </div>
      {!revealed && (
        <button
          type="button"
          onClick={reveal}
          className="mt-3 rounded-full border-2 border-maroon/30 bg-white px-5 py-2.5 text-lg font-medium text-maroon active:scale-95"
        >
          {labels.reveal}
        </button>
      )}
    </div>
  );
}
