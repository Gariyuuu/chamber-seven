import { ItemId } from "./types";

export const ITEM_POOL_WEIGHTS: Record<ItemId, number> = {
  loupe: 5,
  irons: 4,
  hacksaw: 4,
  flask: 4,
  adrenal_shot: 3,
  marked_bullet: 3,
  counterfeit_chip: 3,
  smoke_bomb: 3,
  silver_tongue: 3,
  second_wind: 1,
};

export interface ItemInfo {
  name: string;
  description: string;
  /** Can be used via an explicit use_item action. Second Wind is passive-only. */
  usable: boolean;
}

export const ITEM_INFO: Record<ItemId, ItemInfo> = {
  loupe: {
    name: "Loupe",
    description: "Peek at the next shell in the chamber. Only you see it.",
    usable: true,
  },
  irons: {
    name: "Irons",
    description: "Lock your opponent out of their next turn.",
    usable: true,
  },
  hacksaw: {
    name: "Hacksaw",
    description: "Your next live shot deals double damage.",
    usable: true,
  },
  flask: {
    name: "Flask",
    description: "Rack the chamber, ejecting the next shell without firing it. Its type is revealed to both players.",
    usable: true,
  },
  adrenal_shot: {
    name: "Adrenal Shot",
    description: "Steal a random item from your opponent and use it immediately.",
    usable: true,
  },
  marked_bullet: {
    name: "Marked Bullet",
    description: "Blindly swap the next shell with a random shell later in the chamber.",
    usable: true,
  },
  counterfeit_chip: {
    name: "Counterfeit Chip",
    description: "Reveal one random item currently in your opponent's hand.",
    usable: true,
  },
  smoke_bomb: {
    name: "Smoke Bomb",
    description: "End your turn safely with no shot fired. Your opponent draws one bonus item next reload.",
    usable: true,
  },
  silver_tongue: {
    name: "Silver Tongue",
    description: "Force your opponent to discard one random item from their hand.",
    usable: true,
  },
  second_wind: {
    name: "Second Wind",
    description: "Passive. The first time a shot would drop you to 0 HP, survive at 1 HP instead.",
    usable: false,
  },
};

export function weightedRandomItem(): ItemId {
  const entries = Object.entries(ITEM_POOL_WEIGHTS) as [ItemId, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [item, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return item;
  }
  return entries[entries.length - 1][0];
}
