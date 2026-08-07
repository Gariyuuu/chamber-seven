import { Button } from "@/components/ui/button";
import { ItemId, RedactedState } from "@/lib/game/types";
import { Crown, LogOut, RotateCcw, Sparkles, Swords, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Flourish } from "./Flourish";
import { ITEM_INFO } from "@/lib/game/items";

export interface CareerReward {
  botName: string;
  leveledUp: boolean;
  newLevel: number;
  newItem: ItemId | null;
  newHp: { hpMin: number; hpMax: number };
}

export function MatchEndView({
  state,
  onRematch,
  isCareerMatch = false,
  careerReward,
}: {
  state: RedactedState;
  onRematch: () => void;
  isCareerMatch?: boolean;
  careerReward?: CareerReward | null;
}) {
  const winnerSeat = state.winner!;
  const winner = state.players.find((p) => p.seat === winnerSeat)!;
  const you = state.players.find((p) => p.seat === state.you)!;
  const opponent = state.players.find((p) => p.seat !== state.you);
  const teamMode = state.settings.teamMode;
  const youWon = teamMode === "none" ? winnerSeat === state.you : winner.team === you.team;
  const teammates = teamMode !== "none" ? state.players.filter((p) => p.team === winner.team) : [];
  const standings = [...state.players].sort((a, b) => state.roundWins[b.seat] - state.roundWins[a.seat]);

  function outcomeText() {
    if (isCareerMatch) {
      return youWon ? `You beat ${opponent?.name ?? "your opponent"}.` : `${opponent?.name ?? "Your opponent"} got the better of you this time.`;
    }
    if (teamMode === "boss") {
      return winner.isBoss ? "The Boss wins." : `${teammates.map((p) => p.name).join(" & ")} took down the Boss.`;
    }
    if (teamMode === "duos") {
      return `${teammates.map((p) => p.name).join(" & ")} win the round.`;
    }
    return `${winner.name} took the table.`;
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-24 text-center animate-in fade-in zoom-in-95 duration-500">
      <Crown className="size-10 text-accent drop-shadow-[0_0_16px_color-mix(in_oklch,var(--accent)_60%,transparent)]" />
      <div>
        <p className="font-display text-4xl tracking-wide text-primary drop-shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_50%,transparent)] sm:text-5xl md:text-6xl">
          {youWon ? "YOU SURVIVE" : "TABLE LOST"}
        </p>
        <p className="mt-2 text-muted-foreground">{outcomeText()}</p>
        <Flourish className="mx-auto mt-4 max-w-32" />
      </div>

      {isCareerMatch && youWon && careerReward && (
        <div className="relative w-full space-y-2 overflow-hidden rounded-lg border border-accent/40 bg-accent/10 p-4 text-left">
          {careerReward.leveledUp && (
            <Image
              src="/victory-burst.png"
              alt=""
              fill
              aria-hidden="true"
              className="pointer-events-none scale-150 object-contain opacity-20 mix-blend-plus-lighter animate-in fade-in zoom-in-90 duration-700"
            />
          )}
          {careerReward.leveledUp ? (
            <>
              <p className="relative flex items-center gap-2 font-medium text-accent">
                <TrendingUp className="size-4" />
                Leveled up — rank {careerReward.newLevel}
              </p>
              <p className="relative text-sm text-muted-foreground">
                Health range is now {careerReward.newHp.hpMin}–{careerReward.newHp.hpMax} HP.
              </p>
              {careerReward.newItem && (
                <p className="relative flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="size-3.5 text-accent" />
                  New item unlocked: <span className="font-medium text-foreground">{ITEM_INFO[careerReward.newItem].name}</span>
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Already beaten before — no new unlocks, but good practice.</p>
          )}
        </div>
      )}

      {!isCareerMatch && teamMode === "none" && (
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
              <span className="text-muted-foreground">
                {state.roundWins[p.seat]} round win{state.roundWins[p.seat] === 1 ? "" : "s"}
              </span>
            </div>
          ))}
        </div>
      )}

      {!isCareerMatch && teamMode !== "none" && (
        <div className="w-full space-y-1.5">
          {state.players.map((p) => (
            <div
              key={p.seat}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                p.team === winner.team ? "border-accent/50 bg-accent/10" : "border-border bg-card",
              )}
            >
              <span className="flex items-center gap-1.5">
                {p.isBoss && <Crown className="size-3.5 text-accent" />}
                {p.name}
                {p.seat === state.you && <span className="text-muted-foreground"> (you)</span>}
              </span>
              <span className="text-muted-foreground">{p.eliminated ? "Eliminated" : "Survived"}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {isCareerMatch ? (
          <Button size="lg" asChild className="gap-2">
            <Link href="/career">
              <Swords className="size-4" />
              Back to Career Mode
            </Link>
          </Button>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
