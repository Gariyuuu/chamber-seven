import { ItemId, otherSeat, RedactedState } from "@/lib/game/types";
import { PlayerHud } from "./PlayerHud";
import { ChamberBar } from "./ChamberBar";
import { EventLog } from "./EventLog";
import { ActionBar } from "./ActionBar";
import { ItemCard } from "./ItemCard";

export function PlayingView({
  state,
  onFire,
  onUseItem,
}: {
  state: RedactedState;
  onFire: (target: "self" | "opponent") => void;
  onUseItem: (item: ItemId) => void;
}) {
  const you = state.players[state.you];
  const opponent = state.players[otherSeat(state.you)];
  const isYourTurn = state.turn === state.you && state.phase === "playing";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Round {state.round} · first to {state.roundsToWin} wins the table
        </p>
        <p>
          {state.roundWins[state.you]} - {state.roundWins[otherSeat(state.you)]}
        </p>
      </div>

      <PlayerHud player={opponent} isYou={false} isTurn={state.turn === opponent.seat} />

      <div className="flex flex-wrap justify-center gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2">
        {Array.from({ length: opponent.itemCount }).map((_, i) => (
          <ItemCard key={i} item="loupe" faceDown />
        ))}
        {opponent.itemCount === 0 && (
          <p className="py-2 text-xs text-muted-foreground">No items</p>
        )}
      </div>

      <ChamberBar
        remaining={state.chamberRemaining}
        liveTotal={state.chamberLiveTotal}
        blankTotal={state.chamberBlankTotal}
        peeked={state.peekedShell}
      />

      <div className="h-40">
        <EventLog log={state.log} privateLog={state.privateLog} />
      </div>

      <PlayerHud player={you} isYou={true} isTurn={state.turn === you.seat} />

      <div className="flex flex-wrap justify-center gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2">
        {(you.items ?? []).map((item, i) => (
          <ItemCard
            key={`${item}-${i}`}
            item={item}
            disabled={!isYourTurn}
            onUse={() => onUseItem(item)}
          />
        ))}
        {you.itemCount === 0 && <p className="py-2 text-xs text-muted-foreground">No items</p>}
      </div>

      <ActionBar
        disabled={!isYourTurn}
        opponentName={opponent.name}
        onFireSelf={() => onFire("self")}
        onFireOpponent={() => onFire("opponent")}
      />

      {!isYourTurn && state.phase === "playing" && (
        <p className="text-center text-sm text-muted-foreground">
          Waiting on {opponent.name}...
        </p>
      )}
    </div>
  );
}
