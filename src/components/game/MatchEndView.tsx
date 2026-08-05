import { Button } from "@/components/ui/button";
import { RedactedState } from "@/lib/game/types";
import { Crown, LogOut, RotateCcw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Flourish } from "./Flourish";

export function MatchEndView({
  state,
  onRematch,
}: {
  state: RedactedState;
  onRematch: () => void;
}) {
  const winnerSeat = state.winner!;
  const winner = state.players.find((p) => p.seat === winnerSeat)!;
  const youWon = winnerSeat === state.you;
  const standings = [...state.players].sort((a, b) => state.roundWins[b.seat] - state.roundWins[a.seat]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-24 text-center animate-in fade-in zoom-in-95 duration-500">
      <Crown className="size-10 text-accent drop-shadow-[0_0_16px_color-mix(in_oklch,var(--accent)_60%,transparent)]" />
      <div>
        <p className="font-display text-6xl tracking-wide text-primary drop-shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_50%,transparent)]">
          {youWon ? "YOU SURVIVE" : "TABLE LOST"}
        </p>
        <p className="mt-2 text-muted-foreground">
          {winner.name} took the table.
        </p>
        <Flourish className="mx-auto mt-4 max-w-32" />
      </div>

      <div className="w-full space-y-1.5">
        {standings.map((p, i) => (
          <div
            key={p.seat}
            className={cn(
              "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
              p.seat === winnerSeat ? "border-accent/50 bg-accent/10" : "border-border bg-card",
            )}
          >
            <span>
              #{i + 1} {p.name}
              {p.seat === state.you && <span className="text-muted-foreground"> (you)</span>}
            </span>
            <span className="text-muted-foreground">{state.roundWins[p.seat]} round win{state.roundWins[p.seat] === 1 ? "" : "s"}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button size="lg" onClick={onRematch} className="gap-2">
          <RotateCcw className="size-4" />
          Rematch
        </Button>
        <Button size="lg" variant="outline" asChild className="gap-2">
          <Link href="/">
            <LogOut className="size-4" />
            Leave table
          </Link>
        </Button>
      </div>
    </div>
  );
}
