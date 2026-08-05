"use client";

import { ItemId } from "@/lib/game/types";
import { ITEM_INFO } from "@/lib/game/items";
import { itemColor, COLOR_TEXT, COLOR_BORDER_T, COLOR_BG_SOFT } from "@/lib/game/colors";
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
        "flex h-20 w-16 flex-col items-center justify-center gap-1 rounded-md border border-t-2 text-center transition-all duration-150",
        faceDown
          ? "border-border/60 bg-muted text-muted-foreground"
          : cn(
              "bg-card text-card-foreground hover:-translate-y-0.5 hover:bg-accent/10 hover:shadow-[0_4px_16px_-4px_color-mix(in_oklch,var(--accent)_50%,transparent)]",
              COLOR_BORDER_T[color],
            ),
        disabled && !faceDown && "opacity-40 cursor-not-allowed hover:translate-y-0 hover:shadow-none",
      )}
    >
      {faceDown ? (
        <span className="font-display text-2xl text-muted-foreground/60">?</span>
      ) : (
        <>
          <div className={cn("flex size-7 items-center justify-center rounded-full", COLOR_BG_SOFT[color])}>
            <Icon className={cn("size-4", COLOR_TEXT[color])} />
          </div>
          <span className="text-[10px] font-medium leading-tight">{info.name}</span>
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
