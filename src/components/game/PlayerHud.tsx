"use client";

import { useEffect, useRef, useState } from "react";
import { RedactedPlayer } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { Crown, Skull, WifiOff } from "lucide-react";
import { HealthBar } from "./HealthBar";
import { DealerAvatar, DealerAim } from "./DealerAvatar";
import { PlayerAvatar } from "./PlayerAvatar";
import { SEAT_COLOR, COLOR_BORDER_L, COLOR_TEXT } from "@/lib/game/colors";

export function PlayerHud({
  player,
  isYou,
  isTurn,
  dealerAim,
  dealerFiring,
}: {
  player: RedactedPlayer;
  isYou: boolean;
  isTurn: boolean;
  dealerAim?: DealerAim;
  dealerFiring?: boolean;
}) {
  const color = SEAT_COLOR[player.seat];

  // Every player's HUD row flashes/shakes on damage, not just the local
  // player's full-screen jump-scare — so bot-vs-bot hits still read as
  // impactful, not just a number ticking down.
  const [hit, setHit] = useState(false);
  const prevHpRef = useRef(player.hp);
  useEffect(() => {
    if (player.hp < prevHpRef.current) {
      setHit(true);
      const timer = setTimeout(() => setHit(false), 500);
      prevHpRef.current = player.hp;
      return () => clearTimeout(timer);
    }
    prevHpRef.current = player.hp;
  }, [player.hp]);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-l-4 border-border bg-card px-4 py-3 transition-all",
        !player.eliminated && COLOR_BORDER_L[color],
        isTurn && !player.eliminated && "bg-accent/10 shadow-[0_0_0_1px_var(--accent),0_0_16px_color-mix(in_oklch,var(--accent)_35%,transparent)]",
        player.eliminated && "opacity-50",
        hit && "player-hud-hit",
      )}
    >
      <div className="flex items-center gap-3">
        {player.isBot ? (
          <DealerAvatar
            color={`var(--${color})`}
            aim={dealerAim ?? "side"}
            firing={!!dealerFiring}
            size={40}
          />
        ) : (
          <PlayerAvatar
            color={`var(--${color})`}
            aim={dealerAim ?? "side"}
            firing={!!dealerFiring}
            size={40}
          />
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className={cn("font-medium", player.eliminated && "line-through")}>
              <span className={cn(!player.eliminated && COLOR_TEXT[color])}>{player.name}</span>
              {isYou && <span className="text-muted-foreground"> (you)</span>}
            </p>
            {player.isBoss && <Crown className="size-3.5 text-accent" />}
            {player.team !== null && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                  player.team === 0 ? "bg-chart-3/20 text-chart-3" : "bg-chart-1/20 text-chart-1",
                )}
              >
                Team {player.team === 0 ? "A" : "B"}
              </span>
            )}
            {player.eliminated && <Skull className="size-3.5 text-destructive" />}
            {!player.eliminated && !player.connected && <WifiOff className="size-3.5 text-destructive" />}
          </div>
          <div className="mt-1.5">
            <HealthBar hp={player.hp} maxHp={player.maxHp} />
          </div>
        </div>
      </div>
      <div className="text-right text-sm text-muted-foreground">
        <p>
          {player.itemCount} item{player.itemCount === 1 ? "" : "s"}
        </p>
        {isTurn && !player.eliminated && (
          <p className="text-xs font-medium text-accent">{isYou ? "your turn" : "their turn"}</p>
        )}
      </div>
    </div>
  );
}
