import { ItemId, SeatId } from "./types";

/** Maps to the qualitative chart-1..5 palette defined in globals.css. */
export type ColorToken = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";

export const SEAT_COLOR: Record<SeatId, ColorToken> = {
  p1: "chart-1", // red
  p2: "chart-3", // blue
  p3: "chart-2", // amber
  p4: "chart-5", // purple
};

export type ItemCategory = "offense" | "defense" | "info" | "utility";

export const ITEM_CATEGORY: Record<ItemId, ItemCategory> = {
  magnum_load: "offense",
  hacksaw: "offense",
  molotov: "offense",
  point_blank: "offense",
  vultures_due: "offense",

  riot_vest: "defense",
  scapegoat: "defense",
  second_wind: "defense",

  loupe: "info",
  counterfeit_chip: "info",
  false_confession: "info",

  irons: "utility",
  silver_tongue: "utility",
  sleight_of_hand: "utility",
  smoke_bomb: "utility",
  flask: "utility",
  marked_bullet: "utility",
  loaded_dice: "utility",
  bribe: "utility",
  last_rites: "utility",
  adrenal_shot: "utility",
};

export const CATEGORY_COLOR: Record<ItemCategory, ColorToken> = {
  offense: "chart-1", // red
  defense: "chart-4", // green
  info: "chart-3", // blue
  utility: "chart-5", // purple
};

export function itemColor(item: ItemId): ColorToken {
  return CATEGORY_COLOR[ITEM_CATEGORY[item]];
}

// Literal Tailwind class lookups — kept as static object entries (not template
// strings) so Tailwind's JIT scanner can discover every class at build time.
export const COLOR_TEXT: Record<ColorToken, string> = {
  "chart-1": "text-chart-1",
  "chart-2": "text-chart-2",
  "chart-3": "text-chart-3",
  "chart-4": "text-chart-4",
  "chart-5": "text-chart-5",
};

export const COLOR_BORDER: Record<ColorToken, string> = {
  "chart-1": "border-chart-1",
  "chart-2": "border-chart-2",
  "chart-3": "border-chart-3",
  "chart-4": "border-chart-4",
  "chart-5": "border-chart-5",
};

export const COLOR_BORDER_T: Record<ColorToken, string> = {
  "chart-1": "border-t-chart-1",
  "chart-2": "border-t-chart-2",
  "chart-3": "border-t-chart-3",
  "chart-4": "border-t-chart-4",
  "chart-5": "border-t-chart-5",
};

export const COLOR_BORDER_L: Record<ColorToken, string> = {
  "chart-1": "border-l-chart-1",
  "chart-2": "border-l-chart-2",
  "chart-3": "border-l-chart-3",
  "chart-4": "border-l-chart-4",
  "chart-5": "border-l-chart-5",
};

export const COLOR_BG_SOLID: Record<ColorToken, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
};

export const COLOR_BG_SOFT: Record<ColorToken, string> = {
  "chart-1": "bg-chart-1/12",
  "chart-2": "bg-chart-2/12",
  "chart-3": "bg-chart-3/12",
  "chart-4": "bg-chart-4/12",
  "chart-5": "bg-chart-5/12",
};

export const COLOR_RING: Record<ColorToken, string> = {
  "chart-1": "ring-chart-1/40",
  "chart-2": "ring-chart-2/40",
  "chart-3": "ring-chart-3/40",
  "chart-4": "ring-chart-4/40",
  "chart-5": "ring-chart-5/40",
};
