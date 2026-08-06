"use client";

import { cn } from "@/lib/utils";

export type DealerAim = "viewer" | "side" | null;

/**
 * A hand-drawn 2D silhouette of "the house" — used as the avatar for AI
 * opponents. Idles with a slow breathing sway; when `firing` is true it
 * recoils and flashes. `aim` controls whether the shotgun swings to point
 * out at the viewer (self-shot) or off to the side (shooting someone else).
 */
export function DealerAvatar({
  color = "var(--chart-1)",
  aim = "side",
  firing = false,
  size = 56,
}: {
  color?: string;
  aim?: DealerAim;
  firing?: boolean;
  size?: number;
}) {
  return (
    <div
      className={cn("duel-avatar", firing && "duel-avatar--firing")}
      style={{ width: size, height: size, ["--avatar-color" as string]: color }}
    >
      <svg viewBox="0 0 100 130" className="duel-avatar__figure" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="dealer-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* robe / body */}
        <path
          d="M8 128 L14 66 Q18 50 50 46 Q82 50 86 66 L92 128 Z"
          fill="#0b0a10"
          stroke="color-mix(in oklch, var(--avatar-color) 55%, transparent)"
          strokeWidth="1.2"
        />

        {/* hood */}
        <path
          d="M50 6 C30 6 20 24 20 42 C20 56 33 64 50 64 C67 64 80 56 80 42 C80 24 70 6 50 6 Z"
          fill="#0d0c13"
          stroke="color-mix(in oklch, var(--avatar-color) 70%, transparent)"
          strokeWidth="1.4"
        />

        {/* face void */}
        <ellipse cx="50" cy="38" rx="19" ry="17" fill="#020103" />

        {/* eyes */}
        <g filter="url(#dealer-glow)" className="duel-avatar__eyes">
          <ellipse cx="42" cy="37" rx="3.4" ry="2.6" fill="var(--avatar-color)" />
          <ellipse cx="58" cy="37" rx="3.4" ry="2.6" fill="var(--avatar-color)" />
        </g>

        {/* gun — recoil (CSS-animated translate) wraps aim (React-controlled rotate),
            kept as separate groups so the recoil keyframes never clobber the aim transform */}
        <g className="duel-avatar__gun-recoil">
          <g transform={aim === "viewer" ? "rotate(78 70 78)" : "rotate(-6 70 78)"}>
            <rect x="70" y="74" width="34" height="8" rx="2" fill="#161419" />
            <rect x="98" y="75" width="10" height="6" rx="1.5" fill="#0a090c" />
            <rect x="58" y="72" width="16" height="14" rx="2" fill="#1d1a22" />
            <circle
              cx="106"
              cy="78"
              r="3.4"
              fill="#000"
              stroke="color-mix(in oklch, var(--avatar-color) 60%, transparent)"
              strokeWidth="0.8"
            />
            {/* muzzle flash, only visible while firing */}
            <g className="duel-avatar__flash" filter="url(#dealer-glow)">
              <circle cx="109" cy="78" r="7" fill="var(--avatar-color)" />
              <path
                d="M109 66 L112 76 L122 78 L112 80 L109 90 L106 80 L96 78 L106 76 Z"
                fill="var(--avatar-color)"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
