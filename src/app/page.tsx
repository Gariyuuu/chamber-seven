"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GameSettingsForm } from "@/components/game/GameSettingsForm";
import { generateRoomCode, isValidRoomCode } from "@/lib/roomCode";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DEFAULT_SETTINGS } from "@/lib/game/state";
import { Bot } from "lucide-react";

const NAME_KEY = "chamber-seven:name";
const PENDING_SETTINGS_KEY = "chamber-seven:pending-settings";

export default function HomePage() {
  const router = useRouter();
  const [storedName, setStoredName] = useLocalStorage(NAME_KEY);
  const name = storedName ?? "";
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [hostSettings, setHostSettings] = useState(DEFAULT_SETTINGS);
  const [aiSettings, setAiSettings] = useState(DEFAULT_SETTINGS);
  const [hostOpen, setHostOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  function requireName(): boolean {
    if (!name.trim()) {
      setJoinError("Enter a name first.");
      return false;
    }
    return true;
  }

  function createRoom(settings: typeof DEFAULT_SETTINGS, vsAI: boolean) {
    localStorage.setItem(PENDING_SETTINGS_KEY, JSON.stringify(settings));
    const code = generateRoomCode();
    router.push(`/room/${code}${vsAI ? "?ai=1" : ""}`);
  }

  function handleHostOpen() {
    if (!requireName()) return;
    setHostOpen(true);
  }

  function handleAiOpen() {
    if (!requireName()) return;
    setAiOpen(true);
  }

  function handleJoin() {
    if (!requireName()) return;
    const code = joinCode.trim().toUpperCase();
    if (!isValidRoomCode(code)) {
      setJoinError("That doesn't look like a valid table code.");
      return;
    }
    router.push(`/room/${code}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-16">
      <div className="text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="font-display text-7xl tracking-wide text-primary drop-shadow-[0_0_28px_color-mix(in_oklch,var(--primary)_45%,transparent)] sm:text-8xl">
          CHAMBER&nbsp;SEVEN
        </h1>
        <p className="mt-3 max-w-md text-balance text-muted-foreground">
          One shotgun. A hidden order of live and blank shells. A pocket full of dirty tricks.
          Up to four players, one survivor.
        </p>
      </div>

      <div className="w-full max-w-sm">
        <label className="mb-2 block text-sm font-medium text-muted-foreground" htmlFor="name">
          Your name
        </label>
        <Input
          id="name"
          placeholder="What do they call you?"
          value={name}
          maxLength={20}
          onChange={(e) => setStoredName(e.target.value)}
        />
      </div>

      <div className="grid w-full max-w-4xl gap-6 sm:grid-cols-3">
        <Card className="border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_30px_-8px_color-mix(in_oklch,var(--primary)_35%,transparent)]">
          <CardHeader>
            <CardTitle>Host a Table</CardTitle>
            <CardDescription>Open a new room and send the code to your friends.</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={hostOpen} onOpenChange={setHostOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg" onClick={handleHostOpen}>
                  New Table
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Table settings</DialogTitle>
                  <DialogDescription>Everyone at this table plays by these rules.</DialogDescription>
                </DialogHeader>
                <GameSettingsForm settings={hostSettings} onChange={setHostSettings} />
                <DialogFooter>
                  <Button size="lg" className="w-full" onClick={() => createRoom(hostSettings, false)}>
                    Create Table
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_30px_-8px_color-mix(in_oklch,var(--primary)_35%,transparent)]">
          <CardHeader>
            <CardTitle>Join a Table</CardTitle>
            <CardDescription>Enter the code your host sent you.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              placeholder="CODE"
              value={joinCode}
              maxLength={12}
              className="uppercase"
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            <Button size="lg" onClick={handleJoin}>
              Join
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_30px_-8px_color-mix(in_oklch,var(--primary)_35%,transparent)]">
          <CardHeader>
            <CardTitle>Face the Dealer</CardTitle>
            <CardDescription>Practice against AI opponents. No second player needed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={aiOpen} onOpenChange={setAiOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2" size="lg" variant="secondary" onClick={handleAiOpen}>
                  <Bot className="size-4" />
                  Play vs AI
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Match settings</DialogTitle>
                  <DialogDescription>AI opponents fill every seat but yours.</DialogDescription>
                </DialogHeader>
                <GameSettingsForm settings={aiSettings} onChange={setAiSettings} playerCountLabel="Table size (you + AI)" />
                <DialogFooter>
                  <Button size="lg" className="w-full gap-2" onClick={() => createRoom(aiSettings, true)}>
                    <Bot className="size-4" />
                    Start Match
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {joinError && <p className="text-sm text-destructive">{joinError}</p>}
    </main>
  );
}
