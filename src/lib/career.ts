import { GameSettings, ItemId } from "./game/types";
import { BOT_ROSTER } from "./game/bots";

// Roughly simple -> complex/powerful. The first 3 are unlocked from level 0.
export const CAREER_ITEM_UNLOCK_ORDER: ItemId[] = [
  "loupe",
  "hacksaw",
  "flask",
  "riot_vest",
  "patch_kit",
  "irons",
  "marked_bullet",
  "smoke_bomb",
  "adrenal_shot",
  "silver_tongue",
  "counterfeit_chip",
  "vultures_due",
  "loaded_dice",
  "bribe",
  "point_blank",
  "false_confession",
  "sleight_of_hand",
  "overdose",
  "second_wind",
  "last_rites",
  "molotov",
  "magnum_load",
  "scapegoat",
];

const BASE_ITEM_COUNT = 3;
const BASE_HP = { min: 3, max: 5 };
const HP_STEP = { min: 0.4, max: 0.65 };
const HP_CEILING = 16;

export interface CareerState {
  defeatedBotIds: string[];
}

const CAREER_KEY = "chamber-seven:career";

function readRaw(): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CAREER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function loadCareer(): CareerState {
  const parsed = readRaw() as { defeatedBotIds?: unknown } | null;
  const ids = Array.isArray(parsed?.defeatedBotIds) ? parsed.defeatedBotIds.filter((x) => typeof x === "string") : [];
  return { defeatedBotIds: ids };
}

export function saveCareer(state: CareerState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CAREER_KEY, JSON.stringify(state));
}

export function recordCareerWin(botId: string): CareerState {
  const state = loadCareer();
  if (!state.defeatedBotIds.includes(botId)) {
    state.defeatedBotIds = [...state.defeatedBotIds, botId];
    saveCareer(state);
  }
  return state;
}

/** How many bots you've beaten — doubles as your career "level". */
export function careerLevel(state: CareerState): number {
  return state.defeatedBotIds.length;
}

export function unlockedItems(level: number): ItemId[] {
  const count = Math.min(CAREER_ITEM_UNLOCK_ORDER.length, BASE_ITEM_COUNT + level);
  return CAREER_ITEM_UNLOCK_ORDER.slice(0, count);
}

export function hpRangeForLevel(level: number) {
  const min = Math.min(HP_CEILING, Math.round(BASE_HP.min + level * HP_STEP.min));
  const maxRaw = Math.min(HP_CEILING, Math.round(BASE_HP.max + level * HP_STEP.max));
  const max = Math.max(min + 1, maxRaw);
  return { hpMin: min, hpMax: max };
}

/** The first bot in ladder order you haven't beaten yet — null once the whole roster is cleared. */
export function nextOpponent(state: CareerState) {
  return BOT_ROSTER.find((b) => !state.defeatedBotIds.includes(b.id)) ?? null;
}

export function isUnlocked(botId: string, state: CareerState): boolean {
  const idx = BOT_ROSTER.findIndex((b) => b.id === botId);
  if (idx <= 0) return true;
  return state.defeatedBotIds.includes(BOT_ROSTER[idx - 1].id);
}

export function isCareerComplete(state: CareerState): boolean {
  return BOT_ROSTER.every((b) => state.defeatedBotIds.includes(b.id));
}

/** Builds the exact match settings for fighting a career opponent at the given level. */
export function careerMatchSettings(level: number, botSkill: number): GameSettings {
  const { hpMin, hpMax } = hpRangeForLevel(level);
  return {
    playerCount: 2,
    roundsToWin: 1,
    teamMode: "none",
    hpMin,
    hpMax,
    itemsPerReload: 2,
    enabledItems: unlockedItems(level),
    botSkill,
  };
}
