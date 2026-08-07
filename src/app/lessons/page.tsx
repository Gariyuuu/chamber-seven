import Link from "next/link";
import { ArrowLeft, GraduationCap, Skull } from "lucide-react";
import { Flourish } from "@/components/game/Flourish";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Strategy Lessons — Chamber Seven",
  description: "Tips and strategy to get better at Chamber Seven — odds, item timing, and mode-specific plays.",
};

interface Lesson {
  title: string;
  body: string[];
}

const LESSONS: Lesson[] = [
  {
    title: "Read the odds before every shot",
    body: [
      "The Chamber panel always shows how many live and blank shells are loaded, and how many are left. That's not flavor text — it's the exact math for your next shot. 2 live and 3 blank loaded, 4 shells left? That's 2-in-4, a coin flip.",
      "Recompute this after every single shot, live or blank — the odds shift every time, and a chamber that started 50/50 can swing hard toward live or blank by the third shell.",
    ],
  },
  {
    title: "Shooting yourself isn't just a defensive move",
    body: [
      "A blank fired at yourself keeps your turn. If the odds (or a Loupe peek) tell you blank is more likely, shooting yourself is effectively a free extra turn — you get to act again with no risk taken.",
      "As a rule of thumb: below 50% live odds, shooting yourself is usually better than passing the turn to an opponent. Above 50%, look for a target instead — or find a way to change the odds first.",
    ],
  },
  {
    title: "Loupe turns a guess into a fact",
    body: [
      "If you're not confident in the odds, Loupe is close to a free upgrade — it converts a coin flip into certainty for exactly one shot. Play it early in a fresh reload when you have no other information yet, before you commit to a risky shot.",
      "Whatever Loupe reveals is always trustworthy — a low-skill AI bot never \"forgets\" what it peeked, and neither should you second-guess it.",
    ],
  },
  {
    title: "Sequence your items around what you know",
    body: [
      "Peek first when you can. If you know the next shot is live, Hacksaw or Magnum Load turn that knowledge into real extra damage. If you know it's blank, save those items — there's nothing to boost.",
      "Riot Vest only helps against damage you haven't taken yet, so play it proactively when you're low on HP and short on better information, not as a reaction to a shot that's already resolved.",
    ],
  },
  {
    title: "Adrenal Shot, Silver Tongue, and Vulture's Due are pressure tools",
    body: [
      "Adrenal Shot steals an item AND uses it immediately — it's most valuable against someone you suspect is holding something powerful, like a fresh peek or another damage buff.",
      "Silver Tongue (force a discard) and Vulture's Due (drain HP to yourself) are pure denial and pressure. Both hit hardest against a target who's already low — use them to close out a fight, not to open one.",
    ],
  },
  {
    title: "Scapegoat and Second Wind are insurance, not offense",
    body: [
      "Scapegoat redirects the next live hit that would land on you onto someone else — hold onto it until you're genuinely worried, not the moment you draw it. Playing it too early wastes its only use.",
      "Second Wind is entirely passive: the first time you'd drop to 0 HP, you survive at 1 instead, automatically. There's no play to make — just remember you have a second life banked when you're deciding how risky to play.",
    ],
  },
  {
    title: "2v2 Duos: you can't hurt your own teammate, so pick targets deliberately",
    body: [
      "The target picker only ever offers opponents in a team match — teammates are filtered out entirely. Since you can't spread damage to your own side, concentrate your team's items and shots on whichever opponent is already lower on HP, rather than splitting pressure evenly across both.",
    ],
  },
  {
    title: "Boss Battle plays differently on each side",
    body: [
      "As a challenger: the boss has scaled-up HP and draws extra items specifically to make up for being outnumbered — don't underestimate them. Coordinate with your team and focus fire rather than trading hits one-for-one.",
      "As the boss: your bonus item draws every reload are your whole game plan. Spend them aggressively instead of hoarding — you'll draw more next reload regardless.",
    ],
  },
  {
    title: "Career Mode: match your aggression to the bot's skill",
    body: [
      "Bot skill climbs from roughly 10% at The Rookie up to 100% at The House. Low-tier bots still make real mistakes even when they draw a strong item, so early fights reward playing aggressively and taking risks.",
      "By the top tiers, bots play every item they draw correctly and read the odds accurately — that's exactly when the math from the first lesson above starts to matter the most.",
    ],
  },
];

export default function LessonsPage() {
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

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <p className="mb-1 flex items-center justify-center gap-2 text-xs font-medium tracking-[0.4em] text-muted-foreground uppercase">
            <GraduationCap className="size-3.5" />
            Lessons
          </p>
          <h1 className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text font-display text-4xl tracking-wide text-transparent sm:text-5xl md:text-6xl">
            GET BETTER
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Strategy that actually follows from the rules — not generic tips.
          </p>
          <Flourish className="mx-auto mt-5 max-w-40" />
        </div>

        <div className="space-y-5">
          {LESSONS.map((lesson, i) => (
            <Card key={lesson.title} className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-base">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-sm text-primary">
                    {i + 1}
                  </span>
                  {lesson.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {lesson.body.map((para, j) => (
                  <p key={j} className="text-sm text-muted-foreground">
                    {para}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Need the full item list first?{" "}
          <Link href="/tutorial" className="text-accent hover:underline">
            Read the tutorial
          </Link>
          , then{" "}
          <Link href="/career" className="text-accent hover:underline">
            practice in Career Mode
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
