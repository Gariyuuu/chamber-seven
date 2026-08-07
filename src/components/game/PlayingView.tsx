import { useEffect, useRef, useState } from "react";
import { ItemId, RedactedState, SeatId } from "@/lib/game/types";
import { ITEM_INFO } from "@/lib/game/items";
import { PlayerHud } from "./PlayerHud";
import { ChamberBar } from "./ChamberBar";
import { EventLog } from "./EventLog";
import { ActionBar } from "./ActionBar";
import { ItemCard } from "./ItemCard";
import { TargetSelector } from "./TargetSelector";
import { DealerAim } from "./DealerAvatar";
import { ShootScare, ScareKind } from "./ShootScare";
import { LayoutGrid, Radiation, type LucideIcon } from "lucide-react";
import { SEAT_COLOR, COLOR_TEXT } from "@/lib/game/colors";
import { cn } from "@/lib/utils";

const DEALER_FX_DURATION_MS = 900;

/**
 * Detects a fresh LIVE (damaging) fire that involves the local player —
 * either as the shooter (fired at someone else) or the victim (got hit,
 * whether by their own hand or someone else's) — and returns a one-shot
 * jump-scare cue. Uninvolved shots (e.g. two bots dueling each other) are
 * left to the per-seat avatar firing animation instead.
 */
function useShootScare(log: RedactedState["log"], players: RedactedState["players"], you: SeatId) {
  const [scare, setScare] = useState<{ key: number; kind: ScareKind; color: string; caption: string } | null>(null);
  const prevLenRef = useRef(log.length);
  const keyRef = useRef(0);

  useEffect(() => {
    const prevLen = prevLenRef.current;
    prevLenRef.current = log.length;
    if (log.length <= prevLen) return;

    const fresh = log.slice(prevLen).find((entry) => entry.seat && /: LIVE\.$/.test(entry.message));
    if (!fresh || !fresh.seat) return;

    const actingSeat = fresh.seat;
    const youPlayer = players.find((p) => p.seat === you);
    if (!youPlayer) return;
    const selfShot = /points it at themselves/.test(fresh.message);
    const color = `var(--${SEAT_COLOR[actingSeat]})`;

    let kind: ScareKind | null = null;
    let caption = "";
    if (actingSeat === you) {
      if (selfShot) {
        kind = "victim";
        caption = "SELF-INFLICTED";
      } else {
        kind = "shooter";
        caption = "BANG!";
      }
    } else if (!selfShot && fresh.message.includes(` fires at ${youPlayer.name}: `)) {
      kind = "victim";
      caption = "YOU'VE BEEN HIT";
    }
    if (!kind) return;

    keyRef.current += 1;
    setScare({ key: keyRef.current, kind, color, caption });
  }, [log, players, you]);

  return [scare, () => setScare(null)] as const;
}

/** Detects a fresh "fired" log line from a bot seat and returns a brief visual cue. */
function useDealerFx(log: RedactedState["log"], players: RedactedState["players"]) {
  const [fx, setFx] = useState<{ seat: SeatId; aim: DealerAim } | null>(null);
  const prevLenRef = useRef(log.length);

  useEffect(() => {
    const prevLen = prevLenRef.current;
    prevLenRef.current = log.length;
    if (log.length <= prevLen) return;

    const fresh = log.slice(prevLen).find((entry) => {
      if (!entry.seat) return false;
      const player = players.find((p) => p.seat === entry.seat);
      return player?.isBot && /fires at|points it at themselves|throws a Molotov/.test(entry.message);
    });
    if (!fresh || !fresh.seat) return;

    const aim: DealerAim = /points it at themselves/.test(fresh.message) ? "viewer" : "side";
    setFx({ seat: fresh.seat, aim });
    const timer = setTimeout(() => setFx((cur) => (cur?.seat === fresh.seat ? null : cur)), DEALER_FX_DURATION_MS);
    return () => clearTimeout(timer);
  }, [log, players]);

  return fx;
}

function SectionLabel({
  icon: Icon,
  iconClassName,
  children,
}: {
  icon: LucideIcon;
  iconClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium tracking-widest text-muted-foreground uppercase">
      <Icon className={cn("size-3.5", iconClassName ?? "text-primary/70")} />
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
  const dealerFx = useDealerFx(state.log, state.players);
  const [shootScare, dismissShootScare] = useShootScare(state.log, state.players, state.you);

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
    <>
      {shootScare && (
        <ShootScare
          key={shootScare.key}
          kind={shootScare.kind}
          color={shootScare.color}
          caption={shootScare.caption}
          onDone={dismissShootScare}
        />
      )}
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
            <span key={p.seat} className={cn("font-medium", COLOR_TEXT[SEAT_COLOR[p.seat]])}>
              {p.seat === state.you ? "you" : p.name}: {state.roundWins[p.seat]}
            </span>
          ))}
        </div>
      </div>

      <div className="felt-panel flex flex-col gap-4 rounded-2xl p-3 ring-1 ring-border/60 sm:p-5">
        <div className="grid gap-2 sm:grid-cols-2">
          {others.map((p) => (
            <PlayerHud
              key={p.seat}
              player={p}
              isYou={false}
              isTurn={state.turn === p.seat}
              dealerAim={dealerFx?.seat === p.seat ? dealerFx.aim : "side"}
              dealerFiring={dealerFx?.seat === p.seat}
            />
          ))}
        </div>

        <div className="space-y-1.5">
          <SectionLabel icon={Radiation} iconClassName="text-chart-1">
            The Chamber
          </SectionLabel>
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
          <SectionLabel icon={LayoutGrid} iconClassName="text-chart-2">
            Your Hand
          </SectionLabel>
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
    </>
  );
}
