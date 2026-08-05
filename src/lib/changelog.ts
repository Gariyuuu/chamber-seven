export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.5",
    date: "2026-08-05",
    title: "Neon Tokyo vibes, healing, custom item pools & a leaderboard",
    changes: [
      "New table vibe picker (🎨 icon, top corner) — 5 background color presets including 🌃 Neon Tokyo, persisted per browser, no reload needed.",
      "Ambient neon-city glow behind every page plus a faint skyline silhouette, regardless of which vibe is active.",
      "2 new heal items, both with a catch: Patch Kit heals 1 HP but costs you a random other item; Overdose heals 2 HP but forces your next shell live.",
      "Item pool is now customizable per table: pick exactly which of the 22 items are in play before you start, right in the settings menu.",
      "New cross-match leaderboard (🏆 Leaderboard link) tracking match wins by name across every table — AI wins don't count.",
      "This patch note.",
    ],
  },
  {
    version: "1.4",
    date: "2026-08-05",
    title: "Colorful redesign & patch notes",
    changes: [
      "Fixed a theme bug: a leftover grayscale override was silently winning over the crimson/amber palette on every page — the whole site was rendering black and white regardless of what the theme colors were set to.",
      "Every player now gets a distinct seat color, shown on their name and HUD.",
      "Items are now color-coded by category: offense (red), defense (green), info (blue), utility (purple).",
      "Gradient title, colorized landing cards, a proper multi-color poker chip for the table code.",
      "This changelog page.",
    ],
  },
  {
    version: "1.3",
    date: "2026-08-05",
    title: "Balance pass",
    changes: [
      "Irons and Vulture's Due are now capped at one held per player at a time.",
      "Irons' draw odds lowered — it's now the single rarest item in the pool.",
      "Scapegoat capped at one drawn per match, not per round.",
      "New item: Magnum Load — a rare upgrade over Hacksaw that deals triple damage on your next live shot.",
    ],
  },
  {
    version: "1.2",
    date: "2026-08-05",
    title: "Decorative visual pass",
    changes: [
      "The playing screen now sits inside a felt-table panel with labeled sections.",
      "Table codes are shown on a poker-chip badge instead of plain text.",
      "Flourish dividers, film-grain texture, a custom scrollbar, and a ledger-styled event log.",
    ],
  },
  {
    version: "1.1",
    date: "2026-08-05",
    title: "Free-for-all expansion",
    changes: [
      "Rooms now support up to 4 players in a real elimination-based free-for-all, not just 1v1.",
      "New settings menu: player count, match length (best of 1/3/5), health range (randomized 4–12 by default), items per reload.",
      "10 new items, bringing the total to 20.",
      "Health bars switched to a proportional green/red bar.",
      "AI opponents can now fill every empty seat, not just one.",
    ],
  },
  {
    version: "1.0",
    date: "2026-08-05",
    title: "Launch",
    changes: [
      "Real-time two-player online shotgun duel, built on Next.js and a Cloudflare Worker.",
      "10 original items, several with no equivalent in the reference game.",
      "Solo play against an AI opponent.",
    ],
  },
];
