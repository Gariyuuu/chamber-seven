export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.11",
    date: "2026-08-06",
    title: "Fixed the new backgrounds washing out text, and a real font everywhere",
    changes: [
      "The v1.10 backgrounds had a real contrast bug: a bright hanging-bulb glow and a grid of lit \"windows\" sat right behind page titles, and on phones the background gets cropped/zoomed hard enough that they turned into glaring blocks — exactly the \"white background, can't read the text\" problem some of you hit. Fixed: every background is now much darker overall, the glow/lighting elements are dimmed and pushed down and off to the side, away from where every page's title actually sits.",
      "Also fixed: several page titles (\"CHAMBER SEVEN\", \"TOP SURVIVORS\", etc.) were sized to get BIGGER on small screens instead of smaller, so they ran off the edge of the screen on phones. Now they scale down properly on narrow viewports.",
      "Body text swapped again, from Barlow to Oswald — a bolder, more distinct look so the font change reads across all the UI text, not just the big headline font.",
    ],
  },
  {
    version: "1.10",
    date: "2026-08-06",
    title: "New site icon, human avatars, real fonts, and a jump-scare",
    changes: [
      "New site icon: a 7-chamber revolver cylinder with one shell live, generated for the browser tab and home-screen bookmarks.",
      "Fixed a real bug, not just a taste thing: the whole site's body font had been silently falling back to your browser's default font this whole time, because a CSS variable referenced itself. Now it actually renders the intended typeface — swapped to a grungier pairing while we were in there: a distressed horror-poster display face for headlines, a clean condensed sans for body text.",
      "Human players now get their own animated table-side character — same idle sway and firing recoil the AI dealer has, but bare-headed and jacketed instead of hooded, so it reads as \"a person\" not \"a specter.\" Shows up in the lobby roster and the in-game HUD, including your own seat.",
      "All 5 table-vibe backgrounds got replaced: gone is the glowing-moon-and-light-streaks skyline repeated in 5 colors, in with a genuinely different hand-drawn scene per theme — a rain-slicked brick alley, a flickering neon bar sign, a fire escape, and an overhead bulb, recolored per vibe.",
      "Table talk now animates: each new line slides in instead of just appearing, private reveals get a little more flourish on entry.",
      "New: a full-screen jump-scare on a live (damaging) shot. Fire at someone and a gunman pops up center-screen with a muzzle flash and a screen shake; get hit — by your own hand or someone else's — and the gun swings around to point straight at you instead. Only fires for shots involving you, so 3-4 player tables don't get spammed by every bot-on-bot shot.",
    ],
  },
  {
    version: "1.9",
    date: "2026-08-06",
    title: "A tutorial and a strategy lessons page",
    changes: [
      "New \"How to play\" page: the full rules, every game mode explained, and a complete glossary of all 23 items grouped by category — no more guessing what an item does from its name alone.",
      "New \"Lessons\" page: real strategy tied to the actual mechanics — reading chamber odds, when to shoot yourself, item sequencing, and mode-specific plays for 2v2 Duos, Boss Battle, and Career Mode.",
      "Both are linked from the landing page footer and the in-game header.",
      "Career Mode's venue backdrops (mentioned in the 1.7 notes below) are now actually wired up — the hero image escalates with your next opponent's tier instead of staying static.",
    ],
  },
  {
    version: "1.8",
    date: "2026-08-06",
    title: "2v2 Duos and Boss Battle team modes",
    changes: [
      "New Team Mode selector in settings: Free-for-all (as before), 2v2 Duos, or Boss Battle.",
      "2v2 Duos: locks to 4 players, seats 1+3 vs 2+4, single round. No friendly fire — you can't target or accidentally AOE your own teammate.",
      "Boss Battle: everyone vs. the last seat. The boss gets scaled-up max HP (more with more challengers) and draws extra items every reload to stay dangerous solo. Works with bots too, so you can raid a boss with friends against an AI.",
      "Target picker, HUD, and end screen all show team badges and a crown on the boss, with team-aware win/loss messaging.",
    ],
  },
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
