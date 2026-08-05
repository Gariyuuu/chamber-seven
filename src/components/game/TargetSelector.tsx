import { Bot } from "lucide-react";
import { RedactedPlayer, SeatId } from "@/lib/game/types";
import { cn } from "@/lib/utils";

export function TargetSelector({
  players,
  you,
  selected,
  onSelect,
  disabled,
}: {
  players: RedactedPlayer[];
  you: SeatId;
  selected: SeatId;
  onSelect: (seat: SeatId) => void;
  disabled?: boolean;
}) {
  const alive = players.filter((p) => !p.eliminated);

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {alive.map((p) => (
        <button
          key={p.seat}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(p.seat)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            selected === p.seat
              ? "border-primary bg-primary/15 text-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/40",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          {p.isBot && <Bot className="size-3.5" />}
          {p.seat === you ? "Yourself" : p.name}
        </button>
      ))}
    </div>
  );
}
