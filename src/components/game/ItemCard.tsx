"use client";

import { ItemId } from "@/lib/game/types";
import { ITEM_INFO } from "@/lib/game/items";
import { itemColor, COLOR_TEXT, COLOR_BORDER, COLOR_BG_SOFT, COLOR_BG_SOLID } from "@/lib/game/colors";
import { ITEM_ICONS } from "./itemIcons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ItemCard({
  item,
  disabled,
  faceDown,
  onUse,
}: {
  item: ItemId;
  disabled?: boolean;
  faceDown?: boolean;
  onUse?: () => void;
}) {
  const info = ITEM_INFO[item];
  const Icon = ITEM_ICONS[item];
  const color = itemColor(item);

  const card = (
    <button
      type="button"
      disabled={disabled || faceDown || !onUse}
      onClick={onUse}
      className={cn(
        "flex h-20 w-16 flex-col items-center justify-center gap-1 rounded-md border-2 text-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.6)] transition-all duration-150",
        faceDown
          ? "border-border/60 bg-muted text-muted-foreground"
          : cn(
              "text-card-foreground hover:-translate-y-0.5",
              COLOR_BORDER[color],
              COLOR_BG_SOFT[color],
            ),
        disabled && !faceDown && "opacity-40 cursor-not-allowed hover:translate-y-0",
      )}
    >
      {faceDown ? (
        <span className="font-display text-2xl text-muted-foreground/60">?</span>
      ) : (
        <>
          <div className={cn("flex size-7 items-center justify-center rounded-full text-white shadow-sm", COLOR_BG_SOLID[color])}>
            <Icon className="size-4" />
          </div>
          <span className={cn("text-[10px] font-semibold leading-tight", COLOR_TEXT[color])}>{info.name}</span>
        </>
      )}
    </button>
  );

  if (faceDown) return card;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent className="max-w-56">
        <p className="font-medium">{info.name}</p>
        <p className="text-xs text-muted-foreground">{info.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
