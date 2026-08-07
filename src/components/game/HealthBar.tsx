"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function HealthBar({ hp, maxHp }: { hp: number; maxHp: number }) {
  const pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;

  // A lagging "ghost" trail shows where the bar just was, catching down to
  // the real value a beat later — classic damage-taken readability. `hit`
  // briefly flashes/shakes the whole row so damage registers even at a
  // glance, not just from the number changing.
  const [trailPct, setTrailPct] = useState(pct);
  const [hit, setHit] = useState(false);
  const prevHpRef = useRef(hp);

  useEffect(() => {
    if (hp < prevHpRef.current) {
      setHit(true);
      const flashTimer = setTimeout(() => setHit(false), 500);
      const trailTimer = setTimeout(() => setTrailPct(pct), 220);
      prevHpRef.current = hp;
      return () => {
        clearTimeout(flashTimer);
        clearTimeout(trailTimer);
      };
    }
    prevHpRef.current = hp;
    setTrailPct(pct);
  }, [hp, pct]);

  return (
    <div className={cn("flex items-center gap-2", hit && "health-bar-hit")}>
      <div className="relative h-3 w-28 overflow-hidden rounded-full bg-[oklch(0.32_0.13_25)] shadow-inner">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[oklch(0.6_0.22_25)] transition-[width] duration-700 ease-out"
          style={{ width: `${trailPct}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[oklch(0.64_0.19_145)] shadow-[0_0_8px_oklch(0.64_0.19_145_/_60%)] transition-[width] duration-150 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {hp}/{maxHp}
      </span>
    </div>
  );
}
