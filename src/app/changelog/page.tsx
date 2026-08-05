import Link from "next/link";
import { ArrowLeft, ScrollText, Skull } from "lucide-react";
import { CHANGELOG } from "@/lib/changelog";
import { Flourish } from "@/components/game/Flourish";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { COLOR_BG_SOFT, COLOR_BG_SOLID, COLOR_TEXT, type ColorToken } from "@/lib/game/colors";

const BADGE_COLORS: ColorToken[] = ["chart-1", "chart-3", "chart-2", "chart-5", "chart-4"];

export const metadata = {
  title: "Patch Notes — Chamber Seven",
  description: "Version history and changes for Chamber Seven.",
};

export default function ChangelogPage() {
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
            <ScrollText className="size-3.5" />
            Patch Notes
          </p>
          <h1 className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text font-display text-6xl tracking-wide text-transparent">
            WHAT&nbsp;CHANGED
          </h1>
          <Flourish className="mx-auto mt-5 max-w-40" />
        </div>

        <div className="space-y-5">
          {CHANGELOG.map((entry, i) => {
            const color = BADGE_COLORS[i % BADGE_COLORS.length];
            return (
              <Card key={entry.version} className="border-border/60">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 font-display text-lg tracking-wide",
                        COLOR_BG_SOFT[color],
                        COLOR_TEXT[color],
                      )}
                    >
                      v{entry.version}
                    </span>
                    <CardTitle className="text-base">{entry.title}</CardTitle>
                    <span className="ml-auto text-xs text-muted-foreground">{entry.date}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {entry.changes.map((change, j) => (
                      <li key={j} className="flex gap-2 text-sm text-muted-foreground">
                        <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", COLOR_BG_SOLID[color])} />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
