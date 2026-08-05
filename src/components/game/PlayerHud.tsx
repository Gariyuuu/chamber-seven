import { RedactedPlayer } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { Bot, Skull, WifiOff } from "lucide-react";
import { HealthBar } from "./HealthBar";

export function PlayerHud({
  player,
  isYou,
  isTurn,
}: {
  player: RedactedPlayer;
  isYou: boolean;
  isTurn: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-all",
        isTurn && !player.eliminated
          ? "border-accent bg-accent/10 shadow-[0_0_0_1px_var(--accent),0_0_16px_color-mix(in_oklch,var(--accent)_35%,transparent)]"
          : "border-border bg-card",
        player.eliminated && "opacity-50",
      )}
    >
      <div>
        <div className="flex items-center gap-2">
          <p className={cn("font-medium", player.eliminated && "line-through")}>
            {player.name}
            {isYou && <span className="text-muted-foreground"> (you)</span>}
          </p>
          {player.isBot && <Bot className="size-3.5 text-muted-foreground" />}
          {player.eliminated && <Skull className="size-3.5 text-destructive" />}
          {!player.eliminated && !player.connected && <WifiOff className="size-3.5 text-destructive" />}
        </div>
        <div className="mt-1.5">
          <HealthBar hp={player.hp} maxHp={player.maxHp} />
        </div>
      </div>
      <div className="text-right text-sm text-muted-foreground">
        <p>
          {player.itemCount} item{player.itemCount === 1 ? "" : "s"}
        </p>
        {isTurn && !player.eliminated && (
          <p className="text-xs font-medium text-accent">{isYou ? "your turn" : "their turn"}</p>
        )}
      </div>
    </div>
  );
}
