"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RedactedState } from "@/lib/game/types";
import { Check, Copy, Crown, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { DealerAvatar } from "./DealerAvatar";
import { SEAT_COLOR } from "@/lib/game/colors";
import { teamForSeatIndex } from "@/lib/game/state";

export function Lobby({ state, onStart }: { state: RedactedState; onStart: () => void }) {
  const [copied, setCopied] = useState(false);
  const players = state.players;
  const allConnected = players.every((p) => p.connected);
  const vsAI = players.some((p) => p.isBot);
  const teamMode = state.settings.teamMode;

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-20 text-center">
      <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-500">
        <p className="text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">Table code</p>
        <div className="chip-ring rounded-full">
          <div className="flex items-center justify-center rounded-full bg-card px-9 py-6 ring-1 ring-black/20">
            <p className="font-display text-6xl tracking-widest text-primary drop-shadow-[0_0_20px_color-mix(in_oklch,var(--primary)_40%,transparent)]">
              {state.roomId}
            </p>
          </div>
        </div>
      </div>

      {!vsAI && (
        <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy invite link"}
        </Button>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-base">
            <Users className="size-4" />
            Players ({players.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {players.map((p, i) => {
            const previewTeam = teamForSeatIndex(teamMode, i, players.length);
            const previewIsBoss = teamMode === "boss" && previewTeam === 1;
            return (
              <div
                key={p.seat}
                style={{ animationDelay: `${i * 60}ms` }}
                className="flex animate-in fade-in slide-in-from-left-2 items-center justify-between rounded-md border border-border px-3 py-2 duration-300 fill-mode-both"
              >
                <span className="flex items-center gap-2">
                  {p.isBot && <DealerAvatar color={`var(--${SEAT_COLOR[p.seat]})`} size={24} />}
                  {p.name}
                  {previewIsBoss && <Crown className="size-3.5 text-accent" />}
                  {previewTeam !== null && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                        previewTeam === 0 ? "bg-chart-3/20 text-chart-3" : "bg-chart-1/20 text-chart-1",
                      )}
                    >
                      Team {previewTeam === 0 ? "A" : "B"}
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      p.connected ? "bg-[oklch(0.64_0.19_145)] shadow-[0_0_6px_oklch(0.64_0.19_145_/_70%)]" : "bg-muted-foreground/40",
                    )}
                  />
                  {p.connected ? "ready" : "waiting..."}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Button size="lg" disabled={!allConnected} onClick={onStart} className="w-full gap-2">
        {allConnected ? "Start the Game" : <Loader2 className="size-4 animate-spin" />}
        {!allConnected && "Waiting for players"}
      </Button>
    </div>
  );
}
