"use client";

import { useEffect } from "react";

export type ScareKind = "shooter" | "victim";

const PARTICLE_COUNT = 8;
const SMOKE_COUNT = 3;
const SCARE_DURATION_MS = 2700;

/**
 * A full-screen jump-scare overlay for a LIVE (damaging) shot — a slow,
 * cinematic multi-beat sequence (charge → muzzle flash/kick → shockwave +
 * spark burst → a slow-motion tumbling shell casing and rising smoke →
 * held caption → fade) rather than a single quick pop. `victim` aims the
 * gun straight at the viewer (you got hit, whether by yourself or someone
 * else); `shooter` shows the side-on recoil (you just fired at someone).
 * Auto-dismisses itself once the sequence finishes.
 */
export function ShootScare({
  kind,
  color,
  caption,
  onDone,
}: {
  kind: ScareKind;
  color: string;
  caption: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDone, SCARE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  // The spark burst centers on the muzzle itself (roughly center-forward
  // when the gun points at the viewer, off to the side when aimed away).
  // The casing/smoke get their own, slightly offset origin so they don't
  // just vanish into the shockwave ring/eye glow sitting at dead-center.
  const muzzleOrigin = kind === "victim" ? { left: "50%", top: "54%" } : { left: "76%", top: "60%" };
  const ejectOrigin = kind === "victim" ? { left: "34%", top: "62%" } : { left: "82%", top: "50%" };

  return (
    <div className="shoot-scare" style={{ ["--scare-color" as string]: color }}>
      <div className="shoot-scare__vignette" />
      <div className="shoot-scare__flash" />
      <div className="shoot-scare__shockwave" />

      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (360 / PARTICLE_COUNT) * i;
        const rad = (angle * Math.PI) / 180;
        const radius = 90 + (i % 3) * 20;
        const px = Math.round(Math.cos(rad) * radius);
        const py = Math.round(Math.sin(rad) * radius);
        return (
          <span
            key={i}
            className="shoot-scare__particle"
            style={{
              ...muzzleOrigin,
              ["--px" as string]: `${px}px`,
              ["--py" as string]: `${py}px`,
              animationDelay: `${i * 12}ms`,
            }}
          />
        );
      })}

      <span className="shoot-scare__casing" style={ejectOrigin} />

      {Array.from({ length: SMOKE_COUNT }).map((_, i) => (
        <span
          key={i}
          className="shoot-scare__smoke"
          style={{
            ...ejectOrigin,
            ["--sx" as string]: `${(i - 1) * 16}px`,
            animationDelay: `${i * 180}ms`,
          }}
        />
      ))}

      <svg viewBox="0 0 100 130" className="shoot-scare__figure" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="scare-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M8 128 L14 66 Q18 50 50 46 Q82 50 86 66 L92 128 Z"
          fill="#0b0a10"
          stroke="color-mix(in oklch, var(--scare-color) 65%, transparent)"
          strokeWidth="1.4"
        />
        <path
          d="M50 6 C30 6 20 24 20 42 C20 56 33 64 50 64 C67 64 80 56 80 42 C80 24 70 6 50 6 Z"
          fill="#0d0c13"
          stroke="color-mix(in oklch, var(--scare-color) 80%, transparent)"
          strokeWidth="1.6"
        />
        <ellipse cx="50" cy="38" rx="19" ry="17" fill="#020103" />
        <g filter="url(#scare-glow)">
          <ellipse cx="42" cy="37" rx="4" ry="3.2" fill="var(--scare-color)" />
          <ellipse cx="58" cy="37" rx="4" ry="3.2" fill="var(--scare-color)" />
        </g>

        <g transform={kind === "victim" ? "rotate(78 70 78)" : "rotate(-6 70 78)"}>
          <rect x="66" y="72" width="38" height="10" rx="2.5" fill="#161419" />
          <rect x="98" y="73.5" width="12" height="7" rx="1.5" fill="#0a090c" />
          <rect x="56" y="69" width="18" height="16" rx="2" fill="#1d1a22" />
          <circle
            cx="108"
            cy="77"
            r="3.6"
            fill="#000"
            stroke="color-mix(in oklch, var(--scare-color) 70%, transparent)"
            strokeWidth="0.8"
          />
          <g filter="url(#scare-glow)">
            <circle cx="114" cy="77" r="13" fill="var(--scare-color)" />
            <path
              d="M114 54 L119 73 L138 77 L119 81 L114 100 L109 81 L90 77 L109 73 Z"
              fill="var(--scare-color)"
            />
          </g>
        </g>
      </svg>
      <p className="shoot-scare__caption font-display text-4xl">{caption}</p>
    </div>
  );
}
