"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Skull, Trophy } from "lucide-react";
import { LEADERBOARD_URL, type LeaderboardEntry } from "@/lib/leaderboardApi";
import { Flourish } from "@/components/game/Flourish";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(LEADERBOARD_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: LeaderboardEntry[]) => {
        if (!cancelled) setEntries(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the leaderboard right now.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border/70 bg-background/80 px-4 py-2.5 text-sm shadow-[0_1px_0_0_color-mix(in_oklch,var(--primary)_15%,transparent)] backdrop-blur">
        <Link href="/" className="flex items-center gap-1.5 font-display tracking-wide text-primary">
          <Skull className="size-4" />
          CHAMBER SEVEN
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          Back to the table
        </Link>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12">
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <p className="mb-1 flex items-center justify-center gap-2 text-xs font-medium tracking-[0.4em] text-muted-foreground uppercase">
            <Trophy className="size-3.5" />
            Hall of Fame
          </p>
          <h1 className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text font-display text-4xl tracking-wide text-transparent sm:text-5xl md:text-6xl">
            TOP&nbsp;SURVIVORS
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Match wins recorded across every table. AI wins don&apos;t count.</p>
          <Flourish className="mx-auto mt-5 max-w-40" />
        </div>

        {!entries && !error && (
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <p>Loading the standings...</p>
          </div>
        )}

        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        {entries && entries.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No wins recorded yet — win a match to put your name up here.
          </p>
        )}

        {entries && entries.length > 0 && (
          <Card className="border-border/60">
            <CardContent className="space-y-1.5">
              {entries.map((e, i) => (
                <div
                  key={e.name}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className={cn(
                    "flex animate-in fade-in slide-in-from-left-2 items-center justify-between rounded-md border px-3 py-2 duration-300 fill-mode-both",
                    i < 3 ? "border-accent/40 bg-accent/10" : "border-border bg-card",
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-6 text-center text-sm text-muted-foreground">
                      {i < 3 ? MEDALS[i] : `#${i + 1}`}
                    </span>
                    <span className="font-medium">{e.name}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {e.wins} win{e.wins === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
