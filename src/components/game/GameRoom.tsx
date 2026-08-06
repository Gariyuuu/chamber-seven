"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGameRoom } from "@/hooks/useGameRoom";
import { Lobby } from "./Lobby";
import { PlayingView } from "./PlayingView";
import { MatchEndView, CareerReward } from "./MatchEndView";
import { Loader2, ScrollText, Skull, Trophy } from "lucide-react";
import { GameSettings, ItemId } from "@/lib/game/types";
import { ThemePicker } from "./ThemePicker";
import { botById } from "@/lib/game/bots";
import { careerLevel, hpRangeForLevel, loadCareer, recordCareerWin, unlockedItems } from "@/lib/career";

const NAME_KEY = "chamber-seven:name";
const PENDING_SETTINGS_KEY = "chamber-seven:pending-settings";

function readStoredName(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(NAME_KEY);
}

function readAndClearPendingSettings(): GameSettings | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = localStorage.getItem(PENDING_SETTINGS_KEY);
  if (!raw) return undefined;
  localStorage.removeItem(PENDING_SETTINGS_KEY);
  try {
    return JSON.parse(raw) as GameSettings;
  } catch {
    return undefined;
  }
}

export function GameRoom({
  roomId,
  vsAI = false,
  careerBotId,
}: {
  roomId: string;
  vsAI?: boolean;
  careerBotId?: string;
}) {
  const router = useRouter();
  const [name] = useState(readStoredName);
  const [initialSettings] = useState(readAndClearPendingSettings);

  useEffect(() => {
    if (name === null) router.replace("/");
  }, [name, router]);

  return name ? (
    <ConnectedRoom roomId={roomId} name={name} vsAI={vsAI} initialSettings={initialSettings} careerBotId={careerBotId} />
  ) : null;
}

function ConnectedRoom({
  roomId,
  name,
  vsAI,
  initialSettings,
  careerBotId,
}: {
  roomId: string;
  name: string;
  vsAI: boolean;
  initialSettings?: GameSettings;
  careerBotId?: string;
}) {
  const careerBot = careerBotId ? botById(careerBotId) : undefined;
  const { seat, state, error, connected, startGame, fireAt, useItem, rematch } = useGameRoom(
    roomId,
    name,
    vsAI,
    initialSettings,
    careerBot?.name,
  );

  const recordedRef = useRef(false);
  const [careerReward, setCareerReward] = useState<CareerReward | null>(null);

  useEffect(() => {
    if (!careerBotId || !state || state.phase !== "match_end" || state.winner !== state.you) return;
    if (recordedRef.current) return;
    recordedRef.current = true;

    const before = loadCareer();
    const prevLevel = careerLevel(before);
    const prevItems = unlockedItems(prevLevel);
    const after = recordCareerWin(careerBotId);
    const newLevel = careerLevel(after);
    const newItems = unlockedItems(newLevel);
    const newItem = (newItems.find((i) => !prevItems.includes(i)) ?? null) as ItemId | null;
    const bot = botById(careerBotId);

    setCareerReward({
      botName: bot?.name ?? "Opponent",
      leveledUp: newLevel > prevLevel,
      newLevel,
      newItem,
      newHp: hpRangeForLevel(newLevel),
    });
  }, [careerBotId, state]);

  if (!connected || !state || !seat) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        <p>Connecting to table {roomId}...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border/70 bg-background/80 px-4 py-2.5 text-sm shadow-[0_1px_0_0_color-mix(in_oklch,var(--primary)_15%,transparent)] backdrop-blur">
        <Link href="/" className="flex items-center gap-1.5 font-display tracking-wide text-primary">
          <Skull className="size-4" />
          CHAMBER SEVEN
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            Table <span className="font-medium text-foreground">{state.roomId}</span>
          </span>
          <Link
            href="/leaderboard"
            className="hidden items-center gap-1 text-muted-foreground transition-colors hover:text-accent sm:flex"
          >
            <Trophy className="size-3.5" />
            Leaderboard
          </Link>
          <Link
            href="/changelog"
            className="hidden items-center gap-1 text-muted-foreground transition-colors hover:text-accent sm:flex"
          >
            <ScrollText className="size-3.5" />
            Patch notes
          </Link>
          <ThemePicker />
        </div>
      </header>

      {error && (
        <div className="mx-auto mt-2 animate-in fade-in slide-in-from-top-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-sm text-destructive duration-200">
          {error}
        </div>
      )}

      <div key={state.phase} className="flex flex-1 flex-col animate-in fade-in duration-300">
        {state.phase === "lobby" && <Lobby state={state} onStart={startGame} />}
        {state.phase === "playing" && (
          <PlayingView state={state} onFire={fireAt} onUseItem={useItem} />
        )}
        {state.phase === "match_end" && (
          <MatchEndView state={state} onRematch={rematch} isCareerMatch={!!careerBotId} careerReward={careerReward} />
        )}
      </div>
    </div>
  );
}
