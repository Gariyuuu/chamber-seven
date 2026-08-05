import { Bot } from "lucide-react";
import { RedactedPlayer, SeatId } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { SEAT_COLOR, COLOR_BORDER, COLOR_BG_SOFT, COLOR_TEXT } from "@/lib/game/colors";

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
      {alive.map((p) => {
        const color = SEAT_COLOR[p.seat];
        const isSelected = selected === p.seat;
        return (
          <button
            key={p.seat}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(p.seat)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
              isSelected
                ? cn(COLOR_BORDER[color], COLOR_BG_SOFT[color], COLOR_TEXT[color])
                : "border-border bg-card text-muted-foreground hover:border-foreground/30",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            {p.isBot && <Bot className="size-3.5" />}
            {p.seat === you ? "Yourself" : p.name}
          </button>
        );
      })}
    </div>
  );
}
