"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Crown, Skull, Swords } from "lucide-react";
import { BOT_ROSTER, BotProfile } from "@/lib/game/bots";
import {
  careerLevel,
  careerMatchSettings,
  hpRangeForLevel,
  isCareerComplete,
  isUnlocked,
  loadCareer,
  nextOpponent,
  unlockedItems,
} from "@/lib/career";
import { ALL_ITEM_IDS } from "@/lib/game/items";
import { generateRoomCode } from "@/lib/roomCode";
import { BotCard, BotCardState } from "@/components/game/BotCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flourish } from "@/components/game/Flourish";

const NAME_KEY = "chamber-seven:name";
const PENDING_SETTINGS_KEY = "chamber-seven:pending-settings";

function readStoredName(): string {
  return typeof window === "undefined" ? "" : (localStorage.getItem(NAME_KEY) ?? "");
}

export default function CareerPage() {
  const router = useRouter();
  const [career] = useState(loadCareer);
  const [name] = useState(readStoredName);

  const level = careerLevel(career);
  const next = nextOpponent(career);
  const complete = isCareerComplete(career);
  const { hpMin, hpMax } = hpRangeForLevel(level);
  const items = unlockedItems(level);
  // The venue backdrop escalates with the next opponent's tier — once the
  // roster is cleared, settle on the final (tier 6) venue.
  const venueTier = next?.tier ?? 6;

  function fight(bot: BotProfile) {
    if (!name.trim()) {
      router.push("/");
      return;
    }
    const settings = careerMatchSettings(level, bot.skill);
    localStorage.setItem(PENDING_SETTINGS_KEY, JSON.stringify(settings));
    const code = generateRoomCode();
    router.push(`/room/${code}?ai=1&career=${bot.id}`);
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border/70 bg-background/80 px-4 py-2.5 text-sm shadow-[0_1px_0_0_color-mix(in_oklch,var(--primary)_15%,transparent)] backdrop-blur">
        <Link href="/" className="flex items-center gap-1.5 font-display tracking-wide text-primary">
          <Skull className="size-4" />
          CHAMBER SEVEN
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          Back to the table
        </Link>
      </header>

      <div className="relative h-44 w-full overflow-hidden sm:h-60">
        <Image
          src={`/venues/tier${venueTier}.png`}
          alt=""
          fill
          priority
          className="object-cover transition-opacity duration-500"
        />
        <Image src="/career-hero.png" alt="" fill priority className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 text-center">
          <p className="text-xs font-medium tracking-[0.4em] text-muted-foreground uppercase">Single player</p>
          <h1 className="font-display text-5xl tracking-wide text-primary drop-shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_50%,transparent)] sm:text-6xl">
            CAREER MODE
          </h1>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <Card className="border-border/60">
          <CardContent className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs tracking-widest text-muted-foreground uppercase">Rank</p>
              <p className="font-display text-3xl text-primary">{complete ? "Legend" : `Level ${level}`}</p>
            </div>
            <div>
              <p className="text-xs tracking-widest text-muted-foreground uppercase">Health range</p>
              <p className="text-lg font-medium">
                {hpMin}–{hpMax} HP
              </p>
            </div>
            <div>
              <p className="text-xs tracking-widest text-muted-foreground uppercase">Items unlocked</p>
              <p className="text-lg font-medium">
                {items.length}/{ALL_ITEM_IDS.length}
              </p>
            </div>
            {next && !complete && (
              <Button size="lg" className="gap-2" onClick={() => fight(next)}>
                <Swords className="size-4" />
                Fight {next.name}
              </Button>
            )}
            {complete && (
              <div className="flex items-center gap-2 text-accent">
                <Crown className="size-5" />
                <span className="font-medium">Roster cleared</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Flourish className="my-8" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {BOT_ROSTER.map((bot) => {
            const state: BotCardState = career.defeatedBotIds.includes(bot.id)
              ? "defeated"
              : isUnlocked(bot.id, career)
                ? "current"
                : "locked";
            return (
              <BotCard
                key={bot.id}
                bot={bot}
                state={state}
                onSelect={state !== "locked" ? () => fight(bot) : undefined}
              />
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Beat the bot in front of you to unlock the next one, a little more health, and a new item. Career
          matches are single-round — no rounds-to-win grind, just you and them.
        </p>
      </main>
    </div>
  );
}
