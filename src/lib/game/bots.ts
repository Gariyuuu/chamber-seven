export type BotArchetype = "hood" | "fedora" | "phantom" | "bruiser" | "reaper";

export interface BotProfile {
  id: string;
  name: string;
  tagline: string;
  /** 0..1 — probability the bot makes the "smart" decision on any given action. */
  skill: number;
  archetype: BotArchetype;
  color: string;
  /** Groups the roster into career venues (1 = earliest, 6 = final). */
  tier: number;
}

// Roster order doubles as the career ladder — each bot must be beaten to
// unlock the next. Skill climbs from "barely knows the rules" to "perfect".
export const BOT_ROSTER: BotProfile[] = [
  { id: "rookie", name: "The Rookie", tagline: "Barely knows which end to hold.", skill: 0.1, archetype: "hood", color: "oklch(0.72 0.15 145)", tier: 1 },
  { id: "regular", name: "The Regular", tagline: "Plays it safe. Too safe.", skill: 0.22, archetype: "hood", color: "oklch(0.72 0.14 200)", tier: 1 },
  { id: "bartender", name: "The Bartender", tagline: "Seen every trick in the house.", skill: 0.34, archetype: "fedora", color: "oklch(0.74 0.15 80)", tier: 2 },
  { id: "bookie", name: "The Bookie", tagline: "Always knows the odds.", skill: 0.46, archetype: "fedora", color: "oklch(0.68 0.19 40)", tier: 2 },
  { id: "croupier", name: "The Croupier", tagline: "Runs the table. Rarely loses it.", skill: 0.56, archetype: "hood", color: "oklch(0.62 0.19 250)", tier: 3 },
  { id: "shark", name: "The Shark", tagline: "Smells blood in the water.", skill: 0.65, archetype: "bruiser", color: "oklch(0.62 0.18 195)", tier: 3 },
  { id: "widow", name: "The Widow", tagline: "Nobody's beaten her twice.", skill: 0.73, archetype: "phantom", color: "oklch(0.62 0.22 320)", tier: 4 },
  { id: "undertaker", name: "The Undertaker", tagline: "Already measured you for a box.", skill: 0.8, archetype: "reaper", color: "oklch(0.58 0.17 150)", tier: 4 },
  { id: "kingpin", name: "The Kingpin", tagline: "Owns half the underground.", skill: 0.87, archetype: "bruiser", color: "oklch(0.55 0.22 25)", tier: 5 },
  { id: "phantom", name: "The Phantom", tagline: "You won't see the shot coming.", skill: 0.92, archetype: "phantom", color: "oklch(0.62 0.24 300)", tier: 5 },
  { id: "dealer", name: "The Dealer", tagline: "Dealt the cards. Dealt your fate.", skill: 0.97, archetype: "reaper", color: "oklch(0.64 0.25 345)", tier: 6 },
  { id: "house", name: "The House", tagline: "The house always wins.", skill: 1, archetype: "reaper", color: "oklch(0.75 0.17 80)", tier: 6 },
];

export function botById(id: string): BotProfile | undefined {
  return BOT_ROSTER.find((b) => b.id === id);
}
