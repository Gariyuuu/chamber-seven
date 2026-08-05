import { RedactedPlayer } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { Bot, WifiOff } from "lucide-react";

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
        "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors",
        isTurn ? "border-accent bg-accent/10" : "border-border bg-card",
      )}
    >
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium">
            {player.name}
            {isYou && <span className="text-muted-foreground"> (you)</span>}
          </p>
          {player.isBot && <Bot className="size-3.5 text-muted-foreground" />}
          {!player.connected && <WifiOff className="size-3.5 text-destructive" />}
        </div>
        <div className="mt-1 flex gap-1">
          {Array.from({ length: player.maxHp }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2.5 w-5 rounded-sm",
                i < player.hp ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
      </div>
      <div className="text-right text-sm text-muted-foreground">
        <p>{player.itemCount} item{player.itemCount === 1 ? "" : "s"}</p>
        {isTurn && (
          <p className="text-xs font-medium text-accent">{isYou ? "your turn" : "their turn"}</p>
        )}
      </div>
    </div>
  );
}
