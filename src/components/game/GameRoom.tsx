"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGameRoom } from "@/hooks/useGameRoom";
import { Lobby } from "./Lobby";
import { PlayingView } from "./PlayingView";
import { MatchEndView } from "./MatchEndView";
import { Loader2 } from "lucide-react";
import { GameSettings } from "@/lib/game/types";

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

export function GameRoom({ roomId, vsAI = false }: { roomId: string; vsAI?: boolean }) {
  const router = useRouter();
  const [name] = useState(readStoredName);
  const [initialSettings] = useState(readAndClearPendingSettings);

  useEffect(() => {
    if (name === null) router.replace("/");
  }, [name, router]);

  return name ? (
    <ConnectedRoom roomId={roomId} name={name} vsAI={vsAI} initialSettings={initialSettings} />
  ) : null;
}

function ConnectedRoom({
  roomId,
  name,
  vsAI,
  initialSettings,
}: {
  roomId: string;
  name: string;
  vsAI: boolean;
  initialSettings?: GameSettings;
}) {
  const { seat, state, error, connected, startGame, fireAt, useItem, rematch } = useGameRoom(
    roomId,
    name,
    vsAI,
    initialSettings,
  );

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
      <header className="flex items-center justify-between border-b border-border/70 bg-background/80 px-4 py-2.5 text-sm backdrop-blur">
        <Link href="/" className="font-display tracking-wide text-primary">
          CHAMBER SEVEN
        </Link>
        <span className="text-muted-foreground">Table {state.roomId}</span>
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
        {state.phase === "match_end" && <MatchEndView state={state} onRematch={rematch} />}
      </div>
    </div>
  );
}
