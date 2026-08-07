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
