import Link from "next/link";
import { ArrowLeft, BookOpen, Skull, Users } from "lucide-react";
import { Flourish } from "@/components/game/Flourish";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ALL_ITEM_IDS, ITEM_INFO } from "@/lib/game/items";
import { ITEM_ICONS } from "@/components/game/itemIcons";
import {
  CATEGORY_COLOR,
  COLOR_BG_SOFT,
  COLOR_BG_SOLID,
  COLOR_BORDER,
  COLOR_TEXT,
  ITEM_CATEGORY,
  type ItemCategory,
} from "@/lib/game/colors";

export const metadata = {
  title: "How to Play — Chamber Seven",
  description: "Rules, game modes, and the full item glossary for Chamber Seven.",
};

const CATEGORY_ORDER: ItemCategory[] = ["offense", "defense", "info", "utility"];

const CATEGORY_LABEL: Record<ItemCategory, string> = {
  offense: "Offense",
  defense: "Defense",
  info: "Information",
  utility: "Utility",
};

const CATEGORY_BLURB: Record<ItemCategory, string> = {
  offense: "Boosts your own damage, or forces a bad outcome onto someone else.",
  defense: "Keeps you alive — absorbs, heals, or redirects damage away from you.",
  info: "Turns hidden information — the chamber, an opponent's hand — into something you actually know.",
  utility: "Everything else: hand tricks, tempo plays, and manipulation.",
};

const BASICS = [
  "Each round starts with everyone at a randomized HP total (the range is set in the table's settings).",
  "The chamber holds a hidden, randomized mix of live and blank shells. Nobody knows the exact order, but the table always shows how many live and blank shells are loaded, and how many are left.",
  "On your turn: play any number of items from your hand, then fire — at yourself, or at anyone else still standing.",
  "Fire at yourself and pull a blank → nothing happens, and you go again.",
  "Fire at yourself and pull a live shell → you take damage, and the turn passes.",
  "Fire at anyone else → the turn always passes, whether the shell was live or blank. A live shell damages them.",
  "When the chamber runs dry, it automatically reloads with a fresh, secretly-shuffled mix — same as the start of the round.",
  "Get reduced to 0 HP and you're eliminated — unless something saves you (see Second Wind in the glossary below).",
  "Free-for-all: last player standing wins the round. Win enough rounds (set in table settings) and you take the match.",
  "Team modes (2v2 Duos, Boss Battle) are single-round: last team standing wins immediately, and you can never target your own teammate.",
];

const MODES = [
  { name: "Free-for-all", desc: "2–4 players, every seat for themselves. Last one standing wins the round." },
  { name: "2v2 Duos", desc: "Exactly 4 players, split into two teams. No friendly fire — you can't target or accidentally hit your own teammate." },
  { name: "Boss Battle", desc: "Everyone vs. the last seat, who gets scaled-up HP and extra item draws every reload to make up for being outnumbered." },
  { name: "Play vs AI", desc: "Fill any empty seats with bots — works with every mode above, including a full party raiding an AI boss." },
  { name: "Career Mode", desc: "Climb a 12-bot solo ladder. Beat the bot in front of you to unlock a bit more health and one more item for your pool." },
];

export default function TutorialPage() {
  const itemsByCategory = CATEGORY_ORDER.map((category) => ({
    category,
    items: ALL_ITEM_IDS.filter((id) => ITEM_CATEGORY[id] === category),
  }));

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

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <p className="mb-1 flex items-center justify-center gap-2 text-xs font-medium tracking-[0.4em] text-muted-foreground uppercase">
            <BookOpen className="size-3.5" />
            Tutorial
          </p>
          <h1 className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text font-display text-6xl tracking-wide text-transparent">
            HOW TO PLAY
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The rules, the modes, and every item in the game.
          </p>
          <Flourish className="mx-auto mt-5 max-w-40" />
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">The Basics</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {BASICS.map((line, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="shrink-0 font-display text-base text-primary/70">{i + 1}</span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Flourish className="my-8" />

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-primary" />
              Game modes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MODES.map((mode) => (
              <div key={mode.name}>
                <p className="text-sm font-medium text-foreground">{mode.name}</p>
                <p className="text-sm text-muted-foreground">{mode.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Flourish className="my-8" />

        <div className="mb-6 text-center">
          <h2 className="font-display text-3xl tracking-wide text-primary">ITEM GLOSSARY</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {ALL_ITEM_IDS.length} items, dealt a few at a time at each reload.
          </p>
        </div>

        <div className="space-y-8">
          {itemsByCategory.map(({ category, items }) => {
            const color = CATEGORY_COLOR[category];
            return (
              <div key={category}>
                <p className={cn("mb-1 text-sm font-semibold tracking-wide uppercase", COLOR_TEXT[color])}>
                  {CATEGORY_LABEL[category]}
                </p>
                <p className="mb-3 text-xs text-muted-foreground">{CATEGORY_BLURB[category]}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((id) => {
                    const Icon = ITEM_ICONS[id];
                    const info = ITEM_INFO[id];
                    return (
                      <div
                        key={id}
                        className={cn(
                          "flex gap-3 rounded-lg border p-3",
                          COLOR_BORDER[color],
                          COLOR_BG_SOFT[color],
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm",
                            COLOR_BG_SOLID[color],
                          )}
                        >
                          <Icon className="size-4.5" />
                        </div>
                        <div>
                          <p className={cn("text-sm font-semibold", COLOR_TEXT[color])}>{info.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{info.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Want to put this into practice?{" "}
          <Link href="/lessons" className="text-accent hover:underline">
            Read the strategy lessons
          </Link>{" "}
          or{" "}
          <Link href="/career" className="text-accent hover:underline">
            start climbing Career Mode
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
