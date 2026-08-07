# UI_SYSTEM.md

## Layout system

No shared layout component beyond `src/app/layout.tsx` (fonts + theme-init
script + `TooltipProvider`, applied to every route). Each top-level page
(`page.tsx`, `career/page.tsx`, `leaderboard/page.tsx`,
`changelog/page.tsx`, `tutorial/page.tsx`, `lessons/page.tsx`) repeats
its own header JSX inline (logo link back to `/`, a "back" link,
`ThemePicker` where relevant) — there is **no** extracted
`<Header>`/`<Nav>` component. See `FILE_MAP.md` → "Where to make common
changes" and `TASKS.md` → Technical debt.

## Navigation

Flat, seven routes, all reachable from the landing page footer or
in-game header:

```
/                     landing (name entry, host/join/vs-AI/career)
/room/[roomId]        the game itself (?ai=1, ?career=<botId>)
/career                Career Mode hub
/leaderboard            global leaderboard
/changelog               patch notes
/tutorial                rules + full item glossary
/lessons                 strategy tips
```

`/tutorial` and `/lessons` are linked from the landing page footer and
the in-game header (next to Leaderboard/Patch notes); they are **not**
cross-linked from `/career`, `/leaderboard`, or `/changelog`'s own
headers, consistent with those pages' existing minimal-header
convention (only the landing page and in-game header carry the full
secondary-link set). No nested/dynamic sub-navigation beyond
`[roomId]`.

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
    │   └── DealerAvatar (per bot seat) / PlayerAvatar (per human seat)
    ├── PlayingView (phase = "playing")
    │   ├── ShootScare (full-screen overlay, only while a scare is active)
    │   ├── PlayerHud × (others)
    │   │   └── DealerAvatar (if bot) / PlayerAvatar (if human)
    │   ├── ChamberBar
    │   ├── EventLog ("Table talk")
    │   ├── PlayerHud (you) — also gets a PlayerAvatar as of 2026-08-06
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
| `crimson` (default) | Crimson Noir | 🔴 | `public/backgrounds/bg-crimson.svg` |
| `neon` | Neon Tokyo | 🌃 | `public/backgrounds/bg-neon.svg` |
| `emerald` | Emerald | 🟢 | `public/backgrounds/bg-emerald.svg` |
| `sapphire` | Sapphire | 🔵 | `public/backgrounds/bg-sapphire.svg` |
| `violet` | Violet Dusk | 🟣 | `public/backgrounds/bg-violet.svg` |

**Background art history:** the original 5 backgrounds (through v1.9)
were PNGs sharing one template — a glowing moon + vertical light-streaks
over a city skyline, just recolored per theme. As of 2026-08-06 (v1.10)
these were replaced with hand-authored SVG scenes (a rain-slicked brick
alley, a glowing neon bar-sign, a fire escape, an overhead bulb),
generated via a throwaway Python script (not committed) that reads each
theme's actual `oklch()` `--primary`/`--accent` values, so the art and
the live theme colors are always in sync. If you add a 6th theme, follow
this SVG convention, not the old PNG one.

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

As of 2026-08-06 (v1.11):

- **Body/sans:** `Oswald` (`--font-body`, mapped to Tailwind's
  `--font-sans`), all body text and UI chrome. **v1.10 shipped `Barlow`
  here first; swapped to `Oswald` in v1.11** because user feedback was
  that the font change didn't read as applying to "all the text," only
  the big display headlines — `Oswald`'s condensed, bolder letterforms
  are a much more visually distinct departure from a default system sans
  than `Barlow`'s fairly neutral humanist shapes were.
- **Mono:** `Geist Mono` (`--font-geist-mono`), used for the event log
  (`EventLog.tsx`, `font-mono`). Unchanged since before v1.10.
- **Display:** `Butcherman` (`--font-display`), a distressed
  horror-poster face, used for large headline text (page titles, room
  code, match-end result) *and* the small nav wordmark ("CHAMBER SEVEN")
  — verified legible at both large and small sizes in a real browser.
- All loaded via `next/font/google` in `layout.tsx`.

**Previously `Geist` (sans) + `Bebas Neue` (display).** Both were
replaced per user request ("I don't like the font"). While
investigating, a real bug was found and fixed: `globals.css`'s `@theme
inline` block had `--font-sans: var(--font-sans)` — a self-referential
CSS custom property, which is invalid and silently falls back to the
inherited/initial value. In practice this meant the `font-sans` utility
(applied to `<html>` via `html { @apply font-sans }`) was never actually
resolving to `Geist` at all — the site had been rendering the browser's
default system font this entire time, regardless of what
`next/font/google` had loaded. Fixed to `--font-sans: var(--font-body)`.
**If you ever add another font variable here, verify it's wired end to
end** (loaded in `layout.tsx` → referenced by the exact CSS variable name
`@theme inline` maps `--font-sans`/`--font-display`/etc. to) rather than
trusting that "it builds" means it renders — a build succeeds either way.

## Spacing / border radius / shadows

Tailwind defaults, plus a custom radius scale derived from one base:
`--radius: 0.5rem`, with `--radius-sm` through `--radius-4xl` all
`calc()`'d as multiples of it (`globals.css`'s `@theme inline` block).
No custom spacing scale beyond Tailwind's default. Card/panel shadows use
inline `box-shadow`/`drop-shadow` utility classes rather than a named
shadow scale (e.g. `.felt-panel`'s inset shadow, the shared
`.duel-avatar` class's `drop-shadow`).

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
  - `duel-idle` (breathing sway), `duel-eye-pulse` (glow pulse),
    `duel-recoil` / `duel-kick` (firing animation, triggered by a
    `.duel-avatar--firing` class toggled from React state in
    `PlayerHud.tsx`/`Lobby.tsx` based on `firing`/`aim` props derived
    from fresh event-log entries in `PlayingView.tsx`'s `useDealerFx`).
    Shared by both `DealerAvatar.tsx` and `PlayerAvatar.tsx` (renamed
    from `dealer-*`/`dealer-avatar*` to `duel-*`/`duel-avatar*` on
    2026-08-06 when `PlayerAvatar` was introduced, specifically so both
    components could reuse one animation implementation).
  - `scare-flash` / `scare-pop` / `scare-shake` / `scare-caption`
    (`.shoot-scare*` classes, added 2026-08-06) — the full-screen
    jump-scare overlay (`ShootScare.tsx`): a radial color flash, the
    avatar figure popping in/out, a subtle screen-shake on the overlay
    container, and the caption text fading in/out. Triggered by
    `PlayingView.tsx`'s `useShootScare` hook on a fresh `": LIVE."`-
    suffixed log line involving the local player.
  - `table-talk-in` / `table-talk-in-private` / `table-talk-bullet`
    (`.table-talk__*` classes, added 2026-08-06) — entrance animation
    for new `EventLog.tsx` ("Table talk") lines. Only fires for lines
    that just mounted (React key = the log entry's stable `id`), so
    re-renders don't replay it on already-visible lines.
- **Health bar / shell pips:** `transition-[width]` /
  `transition-transform` for smooth HP-bar and peeked-shell state
  changes.

## Icon system

`lucide-react` for in-app UI icons — no custom SVG icon set beyond the
hand-authored `DealerAvatar`/`PlayerAvatar`/`ShootScare` (full
illustrations, not "icons"). Every `ItemId` maps to exactly one
`LucideIcon` in `src/components/game/itemIcons.tsx`; adding a new item
**requires** adding an entry here (see `FILE_MAP.md`).

**Site icon (browser tab / home screen):** `src/app/icon.tsx` and
`src/app/apple-icon.tsx` (added 2026-08-06), Next.js's dynamic
file-convention icon routes — generated at build/request time via
`next/og`'s `ImageResponse` (JSX + inline `<svg>`, not a static file). A
7-chamber revolver cylinder with one shell lit red, matching "Chamber
Seven." Replaces the default create-next-app `favicon.ico` (deleted —
having both would leave the old placeholder winning the literal
`/favicon.ico` request in some browsers).

## Image assets

All static, bundled at build time under `public/`:

- `public/backgrounds/bg-<theme>.svg` — 5 files, one per theme preset,
  all referenced (`globals.css`). **SVG as of 2026-08-06** (previously
  `.png` — see Themes section above for the full history/rationale).
- `public/bots/<botId>.png` — 12 files, one per `BOT_ROSTER` entry, all
  referenced (`BotCard.tsx`).
- `public/career-hero.png` — 1 file, referenced (`career/page.tsx`).
- `public/venues/tier1.png`–`tier6.png` — 6 files, referenced (as of
  2026-08-06) by `career/page.tsx`, layered behind the Career hub's hero
  banner and selected by the next opponent's tier.
- `public/victory-burst.png` — 1 file, referenced (as of 2026-08-06) by
  `MatchEndView.tsx`, a soft glow behind the level-up panel.
- `public/*.svg` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`,
  `window.svg`) — the default Next.js starter template icons, also
  **unreferenced** by any source file found in this repo (leftover
  scaffolding, harmless, low-priority cleanup candidate).

All game images were produced via hand-authored HTML/CSS/SVG scenes
rasterized with Playwright (per prior session context — there is no
raster image-generation tool available in this project's toolchain), not
via an AI image generator or licensed asset pack, **except** the 5
`bg-<theme>.svg` background files (2026-08-06), which are plain SVG —
not rasterized — generated by a throwaway Python script and referenced
directly as `.svg` in `--bg-image`. No licensing file/attribution exists
for these images; treat them as originally created for this project.

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

- ~~Career Mode's hero background does not change with progression~~ —
  **fixed 2026-08-06**: it now layers the tier-appropriate
  `public/venues/tier<N>.png` behind the hero banner, escalating with
  the next opponent's tier.
- ~~The Lobby does not preview team assignments~~ — **fixed 2026-08-06**:
  team badges and the boss crown now preview in the lobby before a
  team-mode match starts.
- ~~`--font-sans` was a self-referential CSS custom property, so the
  site's body font silently never rendered `Geist` at all~~ — **fixed
  2026-08-06**, and the font was swapped (`Barlow` in v1.10, then
  `Oswald` in v1.11 — see Typography above).
- ~~All 5 theme backgrounds shared one moon-and-light-streaks template,
  just recolored~~ — **fixed 2026-08-06**: replaced with 5 genuinely
  different hand-drawn SVG alley scenes — see Themes above.
- ~~Human players had no avatar at all (only bots did, via
  `DealerAvatar`)~~ — **fixed 2026-08-06**: `PlayerAvatar.tsx` gives
  every human seat, including your own, the same animated treatment.
- ~~v1.10's new backgrounds had a real contrast bug: a bright hanging-bulb
  glow (peak opacity 0.9) and a grid of lit "window" rects (opacity up
  to 0.7, no dim fallback — unlit windows used flat white) sat near the
  vertical/horizontal center of the 1920×1080 scene, which is exactly
  where every page's title sits. On mobile, `background-size: cover`
  crops hard enough that these blew up into glaring rectangular blocks
  directly behind title text — user-reported as "white background,
  can't see the text."~~ — **fixed 2026-08-06 (v1.11)**: all light
  sources capped much lower (bulb glow ≤0.3, windows ≤0.16, no white
  fallback), moved down/off-center away from the title-safe zone (the
  top ~40% and horizontal centerline are now kept near-black across the
  whole composition), rain confined below the title zone too. Verified
  via WebKit + Chromium screenshots at both desktop and iPhone 13
  viewport sizes across all 6 top-level pages.
- ~~Several `font-display` hero headings (`page.tsx`'s "CHAMBER SEVEN",
  and `text-6xl` titles on `/leaderboard`, `/changelog`, `/lessons`,
  `/tutorial`, plus `MatchEndView.tsx`'s result text) had *no* responsive
  downscaling, and `page.tsx`'s specifically went `text-7xl` →
  `sm:text-8xl` (bigger on larger breakpoints only, meaning mobile got
  the *smaller* of the two — but `text-7xl` alone was still too wide for
  `Butcherman`'s letterforms on a narrow phone, overflowing the
  viewport)~~ — **fixed 2026-08-06 (v1.11)**: all of these now scale
  mobile-first (`text-4xl` base, up through `sm:`/`md:`/`lg:` to the
  original desktop size), verified not to overflow on an iPhone 13
  viewport.
- Default Next.js starter SVGs (`file.svg`, `globe.svg`, `next.svg`,
  `vercel.svg`, `window.svg`) remain in `public/` unused — cosmetic
  repo-cleanliness issue only, not a rendering bug.
