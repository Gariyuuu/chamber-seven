import { useState } from "react";
import { ItemId, RedactedState, SeatId } from "@/lib/game/types";
import { ITEM_INFO } from "@/lib/game/items";
import { PlayerHud } from "./PlayerHud";
import { ChamberBar } from "./ChamberBar";
import { EventLog } from "./EventLog";
import { ActionBar } from "./ActionBar";
import { ItemCard } from "./ItemCard";
import { TargetSelector } from "./TargetSelector";
import { LayoutGrid, Radiation, type LucideIcon } from "lucide-react";

function SectionLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium tracking-widest text-muted-foreground uppercase">
      <Icon className="size-3.5 text-primary/70" />
      {children}
    </p>
  );
}

export function PlayingView({
  state,
  onFire,
  onUseItem,
}: {
  state: RedactedState;
  onFire: (target: SeatId) => void;
  onUseItem: (item: ItemId, target?: SeatId) => void;
}) {
  const you = state.players.find((p) => p.seat === state.you)!;
  const others = state.players.filter((p) => p.seat !== state.you);
  const isYourTurn = state.turn === state.you && state.phase === "playing";

  const [target, setTarget] = useState<SeatId>(state.you);
  // Reset the target back to yourself whenever a fresh turn of yours begins,
  // using React's "adjust state during render" pattern instead of an effect.
  const [prevTurn, setPrevTurn] = useState(state.turn);
  if (state.turn !== prevTurn) {
    setPrevTurn(state.turn);
    if (state.turn === state.you) setTarget(state.you);
  }

  const targetPlayer = state.players.find((p) => p.seat === target);
  const isSelfTarget = target === state.you;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-y-1 text-sm text-muted-foreground">
        <p>
          Round {state.round} ·{" "}
          {state.settings.roundsToWin === 1
            ? "single round"
            : `first to ${state.settings.roundsToWin} wins the table`}
        </p>
        <div className="flex gap-3">
          {state.players.map((p) => (
            <span key={p.seat} className={p.seat === state.you ? "text-foreground" : undefined}>
              {p.seat === state.you ? "you" : p.name}: {state.roundWins[p.seat]}
            </span>
          ))}
        </div>
      </div>

      <div className="felt-panel flex flex-col gap-4 rounded-2xl p-3 ring-1 ring-border/60 sm:p-5">
        <div className="grid gap-2 sm:grid-cols-2">
          {others.map((p) => (
            <PlayerHud key={p.seat} player={p} isYou={false} isTurn={state.turn === p.seat} />
          ))}
        </div>

        <div className="space-y-1.5">
          <SectionLabel icon={Radiation}>The Chamber</SectionLabel>
          <ChamberBar
            remaining={state.chamberRemaining}
            liveTotal={state.chamberLiveTotal}
            blankTotal={state.chamberBlankTotal}
            peeked={state.peekedShell}
          />
        </div>

        <div className="h-40">
          <EventLog log={state.log} privateLog={state.privateLog} />
        </div>

        <PlayerHud player={you} isYou={true} isTurn={state.turn === you.seat} />

        {isYourTurn && (
          <TargetSelector players={state.players} you={state.you} selected={target} onSelect={setTarget} />
        )}

        <div className="space-y-1.5">
          <SectionLabel icon={LayoutGrid}>Your Hand</SectionLabel>
          <div className="flex flex-wrap justify-center gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2">
            {(you.items ?? []).map((item, i) => {
              const info = ITEM_INFO[item];
              const needsValidTarget = info.requiresTarget && isSelfTarget;
              return (
                <ItemCard
                  key={`${item}-${i}`}
                  item={item}
                  disabled={!isYourTurn || !info.usable || needsValidTarget}
                  onUse={info.usable ? () => onUseItem(item, info.requiresTarget ? target : undefined) : undefined}
                />
              );
            })}
            {you.itemCount === 0 && <p className="py-2 text-xs text-muted-foreground">No items</p>}
          </div>
        </div>

        <ActionBar
          disabled={!isYourTurn}
          isSelf={isSelfTarget}
          targetName={targetPlayer?.name ?? ""}
          onFire={() => onFire(target)}
        />

        {!isYourTurn && state.phase === "playing" && (
          <p className="text-center text-sm text-muted-foreground">
            Waiting on {state.players.find((p) => p.seat === state.turn)?.name}...
          </p>
        )}
      </div>
    </div>
  );
}
