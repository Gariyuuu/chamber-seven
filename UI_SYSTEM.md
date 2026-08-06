# UI_SYSTEM.md

## Layout system

No shared layout component beyond `src/app/layout.tsx` (fonts + theme-init
script + `TooltipProvider`, applied to every route). Each top-level page
(`page.tsx`, `career/page.tsx`, `leaderboard/page.tsx`,
`changelog/page.tsx`) repeats its own header JSX inline (logo link back
to `/`, a "back" link, `ThemePicker` where relevant) — there is **no**
extracted `<Header>`/`<Nav>` component. See `FILE_MAP.md` → "Where to
make common changes" and `TASKS.md` → Technical debt.

## Navigation

Flat, five routes, all reachable from the landing page or in-game
header:

```
/                     landing (name entry, host/join/vs-AI/career)
/room/[roomId]        the game itself (?ai=1, ?career=<botId>)
/career                Career Mode hub
/leaderboard            global leaderboard
/changelog               patch notes
```

No nested/dynamic sub-navigation beyond `[roomId]`.

## Page structure

- **Landing (`page.tsx`):** name input → 4 cards (Host / Join / vs AI /
  Career), each either a `Dialog` (Host, vs AI — both use
  `GameSettingsForm`) or a direct action (Join — code input; Career —
  navigate).
- **Room (`GameRoom.tsx` → `ConnectedRoom`):** header (logo, room code,
  leaderboard/changelog links, `ThemePicker`) + error banner (transient)
  + one of `Lobby` / `PlayingView` / `MatchEndView` based on
  `state.phase`.
- **Career hub:** header + hero image + rank/HP/items summary card +
  12-card bot grid.
- **Leaderboard / Changelog:** header + centered content column, both
  simple list/card renderings of static or fetched data.

## Reusable components

See `FILE_MAP.md` for the full annotated list of
`src/components/game/*` and `src/components/ui/*`. Component hierarchy
for the main play screen:

```
GameRoom
└── ConnectedRoom
    ├── Lobby (phase = "lobby")
    │   └── DealerAvatar (per bot seat)
    ├── PlayingView (phase = "playing")
    │   ├── PlayerHud × (others)
    │   │   └── DealerAvatar (if bot)
    │   ├── ChamberBar
    │   ├── EventLog
    │   ├── PlayerHud (you)
    │   ├── TargetSelector (your turn only)
    │   ├── ItemCard × (your hand)
    │   └── ActionBar
    └── MatchEndView (phase = "match_end")
```

## Themes

**This is a color-vibe picker, not a light/dark toggle.** The app is
permanently dark (`className="... dark"` hardcoded on `<html>` in
`layout.tsx`) — there is no light mode anywhere in the codebase. 5 vibe
presets, defined in `src/lib/themePresets.ts`:

| id | name | emoji | background asset |
|---|---|---|---|
| `crimson` (default) | Crimson Noir | 🔴 | `public/backgrounds/bg-crimson.png` |
| `neon` | Neon Tokyo | 🌃 | `public/backgrounds/bg-neon.png` |
| `emerald` | Emerald | 🟢 | `public/backgrounds/bg-emerald.png` |
| `sapphire` | Sapphire | 🔵 | `public/backgrounds/bg-sapphire.png` |
| `violet` | Violet Dusk | 🟣 | `public/backgrounds/bg-violet.png` |

**Mechanism:** `ThemePicker.tsx` writes the chosen id to
`localStorage["chamber-seven:theme"]` and sets
`document.documentElement.dataset.theme`. `src/app/globals.css` defines a
`:root[data-theme="<id>"]` block per preset that overrides `--primary`,
`--accent`, `--chart-1`..`--chart-5`, and `--bg-image`. A
`beforeInteractive` inline `<Script>` in `layout.tsx` reads
`localStorage` and sets the attribute *before* React hydrates, to avoid a
flash of the default theme.

## Colors

All defined as CSS custom properties in `oklch()` color space,
`src/app/globals.css`. Base tokens (`--background`, `--foreground`,
`--card`, `--primary`, `--accent`, `--destructive`, `--border`, etc.)
follow shadcn's standard token naming, remapped into Tailwind via the
`@theme inline` block. A **qualitative 5-hue palette**
(`--chart-1`..`--chart-5`) is reused for two unrelated purposes:

- **Per-seat player color** (`SEAT_COLOR` in `src/lib/game/colors.ts`):
  `p1`→chart-1 (red), `p2`→chart-3 (blue), `p3`→chart-2 (amber),
  `p4`→chart-5 (purple).
- **Per-item-category color** (`CATEGORY_COLOR`): offense→chart-1,
  defense→chart-4 (green), info→chart-3 (blue), utility→chart-5 (purple).

**Critical implementation detail:** the Tailwind-class lookups for these
tokens (`COLOR_TEXT`, `COLOR_BORDER`, `COLOR_BG_SOLID`, `COLOR_BG_SOFT`,
etc., all in `colors.ts`) are **static object literals**, not
template-string class construction — this is required for Tailwind's
JIT scanner to discover the classes at build time. See `CLAUDE.md` →
Critical rules and `FILE_MAP.md` → `colors.ts` before changing this
pattern.

## Typography

- **Sans:** `Geist` (`--font-geist-sans`), body text.
- **Mono:** `Geist Mono` (`--font-geist-mono`), used for the event log
  (`EventLog.tsx`, `font-mono`).
- **Display:** `Bebas Neue` (`--font-display`), used for large headline
  text (page titles, room code, match-end result).
- All loaded via `next/font/google` in `layout.tsx`.

## Spacing / border radius / shadows

Tailwind defaults, plus a custom radius scale derived from one base:
`--radius: 0.5rem`, with `--radius-sm` through `--radius-4xl` all
`calc()`'d as multiples of it (`globals.css`'s `@theme inline` block).
No custom spacing scale beyond Tailwind's default. Card/panel shadows use
inline `box-shadow`/`drop-shadow` utility classes rather than a named
shadow scale (e.g. `.felt-panel`'s inset shadow, `DealerAvatar`'s
`drop-shadow`).

## Breakpoints

Tailwind's default breakpoints (`sm`, `md`, `lg`, etc.) used ad hoc per
component (e.g. `sm:grid-cols-2` for the opponent HUD grid,
`sm:grid-cols-3 md:grid-cols-4` for the Career Mode bot grid). No custom
breakpoint values were found in any config file.

## Animations

- **Tailwind/`tw-animate-css` utility animations:** `animate-in`,
  `fade-in`, `zoom-in-95`, `slide-in-from-*`, `duration-*` classes used
  throughout for entrance transitions (match-end screen, lobby player
  list, leaderboard rows, changelog cards).
- **Custom CSS keyframes** (`globals.css` `@layer utilities`):
  `dealer-idle` (breathing sway), `dealer-eye-pulse` (glow pulse),
  `dealer-recoil` / `dealer-kick` (firing animation, triggered by a
  `.dealer-avatar--firing` class toggled from React state in
  `PlayerHud.tsx`/`Lobby.tsx` based on `firing`/`aim` props derived from
  fresh event-log entries in `PlayingView.tsx`'s `useDealerFx`).
- **Health bar / shell pips:** `transition-[width]` /
  `transition-transform` for smooth HP-bar and peeked-shell state
  changes.

## Icon system

`lucide-react` exclusively — no custom SVG icon set beyond the
hand-authored `DealerAvatar` (which is a full illustration, not an
"icon"). Every `ItemId` maps to exactly one `LucideIcon` in
`src/components/game/itemIcons.tsx`; adding a new item **requires**
adding an entry here (see `FILE_MAP.md`).

## Image assets

All static, bundled at build time under `public/`:

- `public/backgrounds/bg-<theme>.png` — 5 files, one per theme preset,
  all referenced (`globals.css`).
- `public/bots/<botId>.png` — 12 files, one per `BOT_ROSTER` entry, all
  referenced (`BotCard.tsx`).
- `public/career-hero.png` — 1 file, referenced (`career/page.tsx`).
- `public/venues/tier1.png`–`tier6.png` — 6 files, **unreferenced by any
  source file** (verified via repo-wide grep). See `FEATURES.md` and
  `TASKS.md` `TASK-004`.
- `public/victory-burst.png` — 1 file, **unreferenced**. Same caveat.
- `public/*.svg` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`,
  `window.svg`) — the default Next.js starter template icons, also
  **unreferenced** by any source file found in this repo (leftover
  scaffolding, harmless, low-priority cleanup candidate).

All game images were produced via hand-authored HTML/CSS/SVG scenes
rasterized with Playwright (per prior session context — there is no
image-generation tool available in this project's toolchain), not via an
AI image generator or licensed asset pack. No licensing file/attribution
exists for these images; treat them as originally created for this
project.

## Accessibility

No dedicated accessibility audit exists in the repo. Baseline coverage
comes from Radix UI primitives underlying shadcn's `Dialog`/`Tooltip`
(focus trapping, `Escape`-to-close, ARIA roles are handled by Radix
itself). No custom ARIA labels were found beyond
`aria-label="Choose a table vibe"` (`ThemePicker.tsx`'s trigger button)
and `aria-hidden="true"` on purely decorative elements (`Flourish.tsx`,
the landing page's giant background `Skull` icon). No documented
keyboard-navigation testing, no documented screen-reader testing, no
color-contrast audit.

## Responsive design

Handled ad hoc per component via Tailwind responsive prefixes — no
documented, centralized responsive strategy. Verified-by-reading examples:
opponent HUD grid (`grid-cols-1 sm:grid-cols-2` implicitly via the base
class plus `sm:` override in `PlayingView.tsx`), landing page cards
(`sm:grid-cols-2 lg:grid-cols-4`), Career Mode bot grid
(`grid-cols-2 sm:grid-cols-3 md:grid-cols-4`).

## Modals

All built on shadcn's `Dialog` (Radix-backed): settings dialogs (Host /
vs AI, both wrapping `GameSettingsForm`), the `ThemePicker`. No custom
modal implementation exists outside this.

## Notifications / toasts

No toast library is installed. The only "notification" pattern is the
transient error banner in `GameRoom.tsx` (a styled `<div>`, not a toast
component, auto-dismissed after 4 seconds via `useGameRoom`'s internal
timeout).

## Forms

No form library (no React Hook Form, no Formik). All inputs are
controlled components with inline `onChange` handlers
(`GameSettingsForm.tsx`, the landing page's name/join-code inputs). No
centralized validation library — validation is either trivial (`.trim()`
checks) or delegated entirely to the server (`clampSettings()`).

## Loading states

- `Loader2` (Lucide, spinning via `animate-spin`) used consistently for:
  connecting to a room (`GameRoom.tsx`), waiting for all lobby players
  (`Lobby.tsx`'s "Start the Game" button swaps to a spinner while
  `!allConnected`), and the leaderboard's initial fetch
  (`leaderboard/page.tsx`).

## Empty states

- Leaderboard: "No wins recorded yet — win a match to put your name up
  here." when the fetched array is empty.
- Item hand: "No items" text when `itemCount === 0`
  (`PlayingView.tsx`).
- No other explicit empty states were found (most lists are always
  non-empty by construction, e.g. the bot roster, the changelog).

## Error states

- Landing page: inline `text-destructive` message for a missing name or
  an invalid join code.
- In-room: transient banner (see Notifications above).
- Leaderboard: "Couldn't load the leaderboard right now." on fetch
  failure.
- No global error boundary (`error.tsx`) was found under `src/app/` —
  an unhandled render exception would fall through to Next.js's default
  error UI.

## Browser support

Not explicitly documented or tested. The codebase uses modern CSS
(`oklch()`, `color-mix()`, CSS nesting via Tailwind, `@layer`) which
requires a reasonably modern evergreen browser (roughly Chrome/Edge
111+, Safari 16.4+, Firefox 113+ for `oklch()`/`color-mix()` support) —
**inferred from the CSS features used**, not from any documented support
matrix in the repo.

## Known visual inconsistencies

- Career Mode's hero background does not change with progression despite
  the changelog implying it should (see `FEATURES.md`).
- The Lobby does not preview team assignments before a team-mode match
  starts (see `FEATURES.md`, `TASKS.md` `TASK-007`).
- Default Next.js starter SVGs (`file.svg`, `globe.svg`, `next.svg`,
  `vercel.svg`, `window.svg`) remain in `public/` unused — cosmetic
  repo-cleanliness issue only, not a rendering bug.
