import { ItemId } from "./types";

export const ITEM_POOL_WEIGHTS: Record<ItemId, number> = {
  loupe: 5,
  // Kept below every other item's weight on purpose — Irons is strong crowd control.
  irons: 0.5,
  hacksaw: 4,
  flask: 4,
  adrenal_shot: 3,
  marked_bullet: 3,
  counterfeit_chip: 3,
  smoke_bomb: 3,
  silver_tongue: 3,
  second_wind: 1,
  riot_vest: 3,
  molotov: 2,
  vultures_due: 3,
  false_confession: 2,
  loaded_dice: 3,
  bribe: 3,
  point_blank: 2,
  sleight_of_hand: 2,
  last_rites: 1,
  scapegoat: 2,
  magnum_load: 1.5,
  patch_kit: 4,
  overdose: 2,
};

export const ALL_ITEM_IDS = Object.keys(ITEM_POOL_WEIGHTS) as ItemId[];

export interface ItemInfo {
  name: string;
  description: string;
  /** Can be used via an explicit use_item action. Second Wind is passive-only. */
  usable: boolean;
  /** Requires choosing another (non-self) player as the target. */
  requiresTarget: boolean;
}

export const ITEM_INFO: Record<ItemId, ItemInfo> = {
  loupe: {
    name: "Loupe",
    description: "Peek at the next shell in the chamber. Only you see it.",
    usable: true,
    requiresTarget: false,
  },
  irons: {
    name: "Irons",
    description: "Lock a chosen player out of their next turn. Rare — and you can only hold one at a time.",
    usable: true,
    requiresTarget: true,
  },
  hacksaw: {
    name: "Hacksaw",
    description: "Your next live shot deals double damage.",
    usable: true,
    requiresTarget: false,
  },
  flask: {
    name: "Flask",
    description: "Rack the chamber, ejecting the next shell without firing it. Its type is revealed to everyone.",
    usable: true,
    requiresTarget: false,
  },
  adrenal_shot: {
    name: "Adrenal Shot",
    description: "Steal a random item from a chosen player and use it immediately.",
    usable: true,
    requiresTarget: true,
  },
  marked_bullet: {
    name: "Marked Bullet",
    description: "Blindly swap the next shell with a random shell later in the chamber.",
    usable: true,
    requiresTarget: false,
  },
  counterfeit_chip: {
    name: "Counterfeit Chip",
    description: "Reveal one random item currently in a chosen player's hand.",
    usable: true,
    requiresTarget: true,
  },
  smoke_bomb: {
    name: "Smoke Bomb",
    description: "End your turn safely with no shot fired. A random other player draws a bonus item next reload.",
    usable: true,
    requiresTarget: false,
  },
  silver_tongue: {
    name: "Silver Tongue",
    description: "Force a chosen player to discard one random item from their hand.",
    usable: true,
    requiresTarget: true,
  },
  second_wind: {
    name: "Second Wind",
    description: "Passive. The first time a shot would drop you to 0 HP, survive at 1 HP instead.",
    usable: false,
    requiresTarget: false,
  },
  riot_vest: {
    name: "Riot Vest",
    description: "Absorbs the next live shot that hits you, no damage taken.",
    usable: true,
    requiresTarget: false,
  },
  molotov: {
    name: "Molotov",
    description: "Your next shot, if fired at another player, catches every other player at the table.",
    usable: true,
    requiresTarget: false,
  },
  vultures_due: {
    name: "Vulture's Due",
    description: "Drain 1 HP from a chosen player and take it for yourself. You can only hold one at a time.",
    usable: true,
    requiresTarget: true,
  },
  false_confession: {
    name: "False Confession",
    description: "Force a chosen player to reveal their entire hand to you.",
    usable: true,
    requiresTarget: true,
  },
  loaded_dice: {
    name: "Loaded Dice",
    description: "Blindly reshuffle the entire remaining chamber.",
    usable: true,
    requiresTarget: false,
  },
  bribe: {
    name: "Bribe",
    description: "End your turn immediately and draw two bonus items for yourself right now.",
    usable: true,
    requiresTarget: false,
  },
  point_blank: {
    name: "Point Blank",
    description: "Your next shot is guaranteed live, whatever shell it actually was.",
    usable: true,
    requiresTarget: false,
  },
  sleight_of_hand: {
    name: "Sleight of Hand",
    description: "Swap your entire item hand with a chosen player's hand.",
    usable: true,
    requiresTarget: true,
  },
  last_rites: {
    name: "Last Rites",
    description: "Revive a random eliminated player back into the round at 1 HP.",
    usable: true,
    requiresTarget: false,
  },
  scapegoat: {
    name: "Scapegoat",
    description: "The next live shot that would hit you is redirected onto a chosen player instead. Only one exists per match.",
    usable: true,
    requiresTarget: true,
  },
  magnum_load: {
    name: "Magnum Load",
    description: "Your next live shot deals triple damage.",
    usable: true,
    requiresTarget: false,
  },
  patch_kit: {
    name: "Patch Kit",
    description: "Heal 1 HP. Costs you a random other item from your hand, if you have one.",
    usable: true,
    requiresTarget: false,
  },
  overdose: {
    name: "Overdose",
    description: "Heal 2 HP, but your next shell is forced live no matter what it really was.",
    usable: true,
    requiresTarget: false,
  },
};

/** Weighted random draw. Pass `allowed` to restrict the pool (e.g. a match's enabled-item settings). */
export function weightedRandomItem(allowed?: ItemId[]): ItemId {
  const pool = allowed && allowed.length > 0 ? allowed : ALL_ITEM_IDS;
  const entries = pool.map((item) => [item, ITEM_POOL_WEIGHTS[item]] as [ItemId, number]);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [item, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return item;
  }
  return entries[entries.length - 1][0];
}
