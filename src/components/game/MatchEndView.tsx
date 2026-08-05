import { Button } from "@/components/ui/button";
import { otherSeat, RedactedState } from "@/lib/game/types";
import { Crown, LogOut, RotateCcw } from "lucide-react";
import Link from "next/link";

export function MatchEndView({
  state,
  onRematch,
}: {
  state: RedactedState;
  onRematch: () => void;
}) {
  const winnerSeat = state.winner!;
  const winner = state.players[winnerSeat];
  const youWon = winnerSeat === state.you;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-24 text-center">
      <Crown className="size-10 text-accent" />
      <div>
        <p className="font-display text-6xl tracking-wide text-primary">
          {youWon ? "YOU SURVIVE" : "TABLE LOST"}
        </p>
        <p className="mt-2 text-muted-foreground">
          {winner.name} took the table {state.roundWins[winnerSeat]}-
          {state.roundWins[otherSeat(winnerSeat)]}.
        </p>
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
