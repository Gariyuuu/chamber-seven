"use client";

import { cn } from "@/lib/utils";
import { DealerAim } from "./DealerAvatar";

/**
 * A hand-drawn 2D silhouette used as the avatar for human players — a
 * bare-headed figure in a collared jacket, as opposed to the hooded
 * DealerAvatar used for AI opponents. Shares the same idle-sway /
 * firing-recoil animation system (the `duel-avatar*` CSS classes) so both
 * read as the same "character at the table" language.
 */
export function PlayerAvatar({
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
          <filter id="player-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* jacket / shoulders, open collar */}
        <path
          d="M10 128 L16 78 Q22 58 40 54 L40 62 Q50 68 60 62 L60 54 Q78 58 84 78 L90 128 Z"
          fill="#12111a"
          stroke="color-mix(in oklch, var(--avatar-color) 55%, transparent)"
          strokeWidth="1.2"
        />
        {/* lapels */}
        <path d="M40 54 L48 74 L44 60 Z" fill="color-mix(in oklch, var(--avatar-color) 35%, #12111a)" />
        <path d="M60 54 L52 74 L56 60 Z" fill="color-mix(in oklch, var(--avatar-color) 35%, #12111a)" />
        {/* shirt / tie strip */}
        <rect x="47" y="58" width="6" height="22" rx="1.5" fill="color-mix(in oklch, var(--avatar-color) 60%, transparent)" />

        {/* neck */}
        <rect x="43" y="42" width="14" height="16" rx="4" fill="#2a2530" />

        {/* head */}
        <ellipse cx="50" cy="30" rx="17" ry="18" fill="#2a2530" stroke="color-mix(in oklch, var(--avatar-color) 45%, transparent)" strokeWidth="1" />
        {/* combed-back hair */}
        <path
          d="M33 26 C33 12 44 4 50 4 C56 4 67 12 67 26 C67 20 60 15 50 15 C40 15 33 20 33 26 Z"
          fill="#0c0b10"
        />

        {/* eyes */}
        <g filter="url(#player-glow)" className="duel-avatar__eyes">
          <ellipse cx="43.5" cy="31" rx="2.4" ry="1.9" fill="var(--avatar-color)" />
          <ellipse cx="56.5" cy="31" rx="2.4" ry="1.9" fill="var(--avatar-color)" />
        </g>

        {/* gun — recoil (CSS-animated translate) wraps aim (React-controlled rotate) */}
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
            <g className="duel-avatar__flash" filter="url(#player-glow)">
              <circle cx="109" cy="78" r="7" fill="var(--avatar-color)" />
              <path
                d="M109 66 L112 76 L122 78 L112 80 L109 90 L106 80 L96 78 L106 76 Z"
                fill="var(--avatar-color)"
              />
            </g>
            {/* muzzle smoke — lingers longer than the flash via a slower CSS transition */}
            <circle cx="113" cy="76" r="6" fill="#cfcac0" className="duel-avatar__smoke" />
          </g>
        </g>
      </svg>
    </div>
  );
}
