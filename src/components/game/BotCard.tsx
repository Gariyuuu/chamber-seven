import Image from "next/image";
import { BotProfile } from "@/lib/game/bots";
import { CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type BotCardState = "defeated" | "current" | "locked";

export function BotCard({
  bot,
  state,
  onSelect,
}: {
  bot: BotProfile;
  state: BotCardState;
  onSelect?: () => void;
}) {
  const locked = state === "locked";

  return (
    <button
      type="button"
      disabled={locked || !onSelect}
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all duration-200",
        state === "current" &&
          "border-2 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_var(--bot-color)]",
        state === "defeated" && "border-border/60 hover:-translate-y-0.5",
        locked && "cursor-not-allowed border-border/40 opacity-55",
      )}
      style={{ ["--bot-color" as string]: bot.color, borderColor: state === "current" ? bot.color : undefined }}
    >
      <div className="relative aspect-[500/640] w-full bg-black/40">
        <Image
          src={`/bots/${bot.id}.png`}
          alt={bot.name}
          fill
          className={cn("object-cover transition-transform duration-300", !locked && "group-hover:scale-105", locked && "grayscale")}
          sizes="(max-width: 640px) 45vw, 200px"
        />
        {state === "defeated" && (
          <div className="absolute top-2 right-2 rounded-full bg-black/70 p-1">
            <CheckCircle2 className="size-4" style={{ color: bot.color }} />
          </div>
        )}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Lock className="size-6 text-muted-foreground" />
          </div>
        )}
        {state === "current" && (
          <div
            className="absolute inset-x-0 bottom-0 h-1.5"
            style={{ background: bot.color, boxShadow: `0 0 12px 2px ${bot.color}` }}
          />
        )}
      </div>
      <div className="space-y-0.5 bg-card px-3 py-2">
        <p className="truncate text-sm font-semibold">{bot.name}</p>
        <p className="truncate text-xs text-muted-foreground">{locked ? "Locked" : bot.tagline}</p>
      </div>
    </button>
  );
}
