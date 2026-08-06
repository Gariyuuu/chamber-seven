export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.7",
    date: "2026-08-05",
    title: "Career Mode: a 12-bot ladder, and 20 more illustrated images",
    changes: [
      "New Career Mode: a chess.com-style bot ladder, 12 named opponents from The Rookie up to The House, each genuinely weaker or stronger — bots now make worse decisions on purpose at low skill instead of all playing at full strength.",
      "Beat the bot in front of you to level up: unlocks a little more max HP and one new item at a time, starting from a small basic kit and ending with the full 23-item pool. Progress is saved on this device.",
      "12 hand-illustrated bot portraits across 5 distinct character designs (hooded, fedora gambler, jester mask, bruiser, ragged reaper), plus 6 mood-lit venue backdrops that escalate from a dim back alley to a blood-red penthouse as you climb the ladder — 20 new real images in total, all originally drawn for this game.",
      "Quick vs-AI play (\"Face the Dealer\") is unchanged — Career Mode is a separate, new way to play.",
    ],
  },
  {
    version: "1.6",
    date: "2026-08-05",
    title: "Real background art, a living dealer, and bolder item colors",
    changes: [
      "Every table vibe now has a genuine hand-illustrated skyline as its background — a glowing moon, lit windows, neon signs — rendered as a real PNG per theme, not a CSS gradient.",
      "Item cards got a real color pass: solid category-colored icon badges, tinted card fill, and colored names, not just a thin border.",
      "New animated dealer character: AI opponents are now a 2D hooded figure with glowing eyes and a shotgun, idly swaying at the table. When they fire, the gun recoils and flashes — aimed at you if they turn it on themselves, aimed aside if they go for someone else.",
    ],
  },
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
