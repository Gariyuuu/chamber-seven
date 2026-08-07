export interface ThemePreset {
  id: string;
  name: string;
  emoji: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: "crimson", name: "Crimson Noir", emoji: "🔴" },
  { id: "neon", name: "Neon Tokyo", emoji: "🌃" },
  { id: "emerald", name: "Emerald", emoji: "🟢" },
  { id: "sapphire", name: "Sapphire", emoji: "🔵" },
  { id: "violet", name: "Violet Dusk", emoji: "🟣" },
];

export const DEFAULT_THEME_ID = "crimson";
export const THEME_STORAGE_KEY = "chamber-seven:theme";
export const CUSTOM_BG_STORAGE_KEY = "chamber-seven:custom-bg";
/** Roughly caps the base64-encoded data URL well under typical per-origin
 * localStorage quotas (~5MB), leaving headroom for everything else stored there. */
export const CUSTOM_BG_MAX_BYTES = 3_000_000;

export interface BgStyle {
  id: string;
  name: string;
  emoji: string;
}

/** Alternate built-in background compositions, each rendered per theme as
 * `bg-<themeId>.png` (default style, "felt") or `bg-<themeId>-<styleId>.png`. */
export const BG_STYLES: BgStyle[] = [
  { id: "felt", name: "Felt Table", emoji: "🃏" },
  { id: "embers", name: "Smoke & Embers", emoji: "✨" },
  { id: "chips", name: "Chip Scatter", emoji: "🔴" },
  { id: "shells", name: "Shell Scatter", emoji: "🔫" },
  { id: "cards", name: "Card Fan", emoji: "🂡" },
  { id: "dice", name: "Dice Roll", emoji: "🎲" },
  { id: "roulette", name: "Roulette", emoji: "🎡" },
  { id: "velvet", name: "Velvet Drape", emoji: "🎭" },
  { id: "smoke", name: "Smoke Wisps", emoji: "💨" },
  { id: "crosshair", name: "Crosshair", emoji: "🎯" },
];
export const DEFAULT_BG_STYLE_ID = "felt";
export const BG_STYLE_STORAGE_KEY = "chamber-seven:bg-style";

export function backgroundUrl(themeId: string, styleId: string): string {
  const suffix = styleId === DEFAULT_BG_STYLE_ID ? "" : `-${styleId}`;
  return `/backgrounds/bg-${themeId}${suffix}.png`;
}
