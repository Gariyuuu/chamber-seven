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
import { Bot, BookOpen, GraduationCap, ScrollText, Skull, Swords, Trophy, Users } from "lucide-react";
import { Flourish } from "@/components/game/Flourish";
import { ThemePicker } from "@/components/game/ThemePicker";
import Link from "next/link";

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

  function goToCareer() {
    if (!requireName()) return;
    router.push("/career");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden px-4 py-16">
      <div className="absolute top-4 right-4 z-10">
        <ThemePicker />
      </div>

      <div className="relative text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <p className="mb-1 text-xs font-medium tracking-[0.4em] text-muted-foreground uppercase">
          An underground table game
        </p>
        <h1 className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text font-display text-4xl tracking-wide text-transparent drop-shadow-[0_0_28px_color-mix(in_oklch,var(--primary)_45%,transparent)] sm:text-6xl md:text-7xl lg:text-8xl">
          CHAMBER&nbsp;SEVEN
        </h1>
        <p className="mt-3 max-w-md text-balance text-muted-foreground">
          One shotgun. A hidden order of live and blank shells. A pocket full of dirty tricks.
          Up to four players, one survivor.
        </p>
        <Flourish className="mx-auto mt-5 max-w-40" />
      </div>

      <div className="relative w-full max-w-sm">
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

      <div className="relative grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_30px_-8px_color-mix(in_oklch,var(--primary)_35%,transparent)]">
          <CardHeader>
            <div className="mb-1 flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/20">
              <Skull className="size-4.5" />
            </div>
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
                  <DialogTitle className="flex items-center gap-2">
                    <Skull className="size-4 text-primary" />
                    Table settings
                  </DialogTitle>
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

        <Card className="border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-chart-3/50 hover:shadow-[0_8px_30px_-8px_color-mix(in_oklch,var(--chart-3)_35%,transparent)]">
          <CardHeader>
            <div className="mb-1 flex size-9 items-center justify-center rounded-full bg-chart-3/15 text-chart-3 ring-1 ring-chart-3/25">
              <Users className="size-4.5" />
            </div>
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
            <Button
              size="lg"
              className="glossy bg-chart-3 text-white hover:bg-chart-3/80"
              onClick={handleJoin}
            >
              Join
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-chart-5/50 hover:shadow-[0_8px_30px_-8px_color-mix(in_oklch,var(--chart-5)_35%,transparent)]">
          <CardHeader>
            <div className="mb-1 flex size-9 items-center justify-center rounded-full bg-chart-5/15 text-chart-5 ring-1 ring-chart-5/25">
              <Bot className="size-4.5" />
            </div>
            <CardTitle>Face the Dealer</CardTitle>
            <CardDescription>Practice against AI opponents. No second player needed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={aiOpen} onOpenChange={setAiOpen}>
              <DialogTrigger asChild>
                <Button
                  className="glossy w-full gap-2 bg-chart-5 text-white hover:bg-chart-5/80"
                  size="lg"
                  onClick={handleAiOpen}
                >
                  <Bot className="size-4" />
                  Play vs AI
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Bot className="size-4 text-chart-5" />
                    Match settings
                  </DialogTitle>
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

        <Card className="border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-chart-2/50 hover:shadow-[0_8px_30px_-8px_color-mix(in_oklch,var(--chart-2)_35%,transparent)]">
          <CardHeader>
            <div className="mb-1 flex size-9 items-center justify-center rounded-full bg-chart-2/15 text-chart-2 ring-1 ring-chart-2/25">
              <Swords className="size-4.5" />
            </div>
            <CardTitle>Career Mode</CardTitle>
            <CardDescription>Climb a 12-bot ladder. Beat one to unlock more health and items.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="glossy w-full gap-2 bg-chart-2 text-white hover:bg-chart-2/80"
              size="lg"
              onClick={goToCareer}
            >
              <Swords className="size-4" />
              Start Career
            </Button>
          </CardContent>
        </Card>
      </div>

      {joinError && (
        <p className="animate-in fade-in text-sm text-destructive duration-200">{joinError}</p>
      )}

      <div className="mt-4 flex w-full max-w-xs flex-col items-center gap-3">
        <Flourish className="w-full" />
        <p className="text-[0.7rem] tracking-widest text-muted-foreground/70 uppercase">
          House rules apply. Good luck.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/tutorial"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-accent"
          >
            <BookOpen className="size-3.5" />
            How to play
          </Link>
          <Link
            href="/lessons"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-accent"
          >
            <GraduationCap className="size-3.5" />
            Lessons
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-accent"
          >
            <Trophy className="size-3.5" />
            Leaderboard
          </Link>
          <Link
            href="/changelog"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-accent"
          >
            <ScrollText className="size-3.5" />
            Patch notes
          </Link>
        </div>
      </div>
    </main>
  );
}
