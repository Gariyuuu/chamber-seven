"use client";

import { ItemId } from "@/lib/game/types";
import { ITEM_INFO } from "@/lib/game/items";
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

  const card = (
    <button
      type="button"
      disabled={disabled || faceDown || !onUse}
      onClick={onUse}
      className={cn(
        "flex h-20 w-16 flex-col items-center justify-center gap-1 rounded-md border text-center transition-colors",
        faceDown
          ? "border-border/60 bg-muted text-muted-foreground"
          : "border-border bg-card text-card-foreground hover:border-accent hover:bg-accent/10",
        disabled && !faceDown && "opacity-40 cursor-not-allowed hover:border-border hover:bg-card",
      )}
    >
      {faceDown ? (
        <span className="font-display text-2xl text-muted-foreground/60">?</span>
      ) : (
        <>
          <Icon className="size-5" />
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
