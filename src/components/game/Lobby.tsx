"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RedactedState } from "@/lib/game/types";
import { Check, Copy, Loader2, Users } from "lucide-react";

export function Lobby({ state, onStart }: { state: RedactedState; onStart: () => void }) {
  const [copied, setCopied] = useState(false);
  const players = Object.values(state.players);
  const bothConnected = players.every((p) => p.connected);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-20 text-center">
      <div>
        <p className="text-sm text-muted-foreground">Table code</p>
        <p className="font-display text-6xl tracking-widest text-primary">{state.roomId}</p>
      </div>

      <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : "Copy invite link"}
      </Button>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-base">
            <Users className="size-4" />
            Players
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {players.map((p) => (
            <div
              key={p.seat}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <span>{p.name}</span>
              <span className="text-xs text-muted-foreground">
                {p.connected ? "ready" : "waiting..."}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button size="lg" disabled={!bothConnected} onClick={onStart} className="w-full gap-2">
        {bothConnected ? "Start the Game" : <Loader2 className="size-4 animate-spin" />}
        {!bothConnected && "Waiting for opponent"}
      </Button>
    </div>
  );
}
