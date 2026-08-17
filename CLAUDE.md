# CLAUDE.md — Operating Manual for Chamber Seven

This file is the primary entry point for any AI coding agent (or human)
picking up this repository. Read this first, then `PROJECT_STATE.md`, then
`TASKS.md`, before touching code.

This entire memory system (`CLAUDE.md`, `PROJECT_STATE.md`, `ARCHITECTURE.md`,
`FILE_MAP.md`, `FEATURES.md`, `TASKS.md`, `ROADMAP.md`, `DECISIONS.md`,
`DATABASE.md`, `API_REFERENCE.md`, `UI_SYSTEM.md`, `SECURITY.md`,
`TESTING.md`, `DEPLOYMENT.md`, `CHANGELOG.md`, `SESSION_LOG.md`,
`HANDOFF.md`) was generated on **2026-08-06** by auditing the actual
repository (source, config, git history) — not by recalling prior chat
history. Where something couldn't be verified from the repo, it is
labeled **Unverified** or **Inferred** rather than stated as fact.

## Project identity

- **Name:** Chamber Seven
- **One-sentence description:** A browser-based, real-time multiplayer
  shotgun-duel game (2–4 players, FFA/2v2/boss-raid) with a private hand of
  "dirty trick" items, inspired by *Buckshot Roulette* but with its own
  rules, item set, and a single-player Career Mode ladder against 12 named
  AI bots.
- **Detailed summary:** Players take turns choosing to fire a shared,
  randomly-loaded shotgun (a hidden sequence of live/blank shells) at
  themselves or another player. A self-fired blank keeps your turn; a
  self-fired live shell damages you and passes the turn; firing at someone
  else always passes the turn. 22 items (peek, steal, heal, redirect damage,
  reshuffle, etc.) are dealt from a per-match-configurable pool and let
  players manipulate the odds or the state. Modes: 2-4 player free-for-all,
  2v2 Duos, 1-vs-everyone Boss Battle, human vs AI bots (any mix of seats),
  and a single-player Career Mode ladder (12 bots, unlocks HP/items on win).
  A lightweight cross-match leaderboard tracks human match wins by name.
- **Target audience:** Casual browser players who want a quick, tense,
  social bluffing/odds game — solo against AI or with friends via a shared
  room code. No accounts, no persistence beyond `localStorage` and one
  Durable Object per room.
- **Current development stage:** Actively-developed hobby/indie project,
  functionally a polished MVP+ (real backend, real multiplayer, real art,
  9 shipped version bumps). Not hardened for abuse/scale (see
  `SECURITY.md`). **Not a commercial product** — no payments, no accounts,
  no user data retention beyond win-name/count.
- **Production status:** **Deployed and publicly live** at
  **https://chamber-seven-omega.vercel.app** (Vercel, frontend) backed by
  the Cloudflare Worker at **https://chamber-seven.chamber-seven.workers.dev**
  (confirmed via a real deploy — see `DEPLOYMENT.md`). As of the
  2026-08-07 checkpoint, `git log`/`src/lib/changelog.ts` show the
  in-repo record at **v1.21** (a jump-scare animation refinement); `main`
  is confirmed fully pushed to `origin/main` (0 ahead / 0 behind — see
  "Current status" below for the full git-state history). **Confirmed
  actually deployed**, not just committed: a `curl` against the live
  `/changelog` page (2026-08-07) shows the v1.17–v1.21 entry text
  present, and the Worker's `/leaderboard` endpoint responds 200 with
  real data — both checked directly against production, not assumed
  from git state.
- **Repository type:** Single app, **not** a monorepo. One `package.json`
  at the root runs both the Next.js app and (via `wrangler`) the Cloudflare
  Worker; they share TypeScript source under `src/lib/game/` but are two
  separate TypeScript projects (`tsconfig.json` for the app,
  `party/tsconfig.json` for the Worker) with two separate deploy targets
  (Vercel and Cloudflare).
- **Important scope note:** `~/Projects` (the parent of this repo) is
  **not** a monorepo — it's ~20 unrelated, independently-pushed git repos
  belonging to the same developer. Nothing in this memory system applies
  outside `~/Projects/chamber-seven`.

## Current status

See `PROJECT_STATE.md` for the exact, timestamped snapshot. Summary:

- **Latest deployed milestone (re-verified 2026-08-07):** v1.21 —
  slower/heavier jump-scare sequence with a tumbling shell casing. This
  is the 9th version bump (v1.13–v1.21) since the memory system's last
  documentation sync (which stopped at v1.12), covering: v1.13 (removed
  the landing-page skull icon), v1.14 (felt-table PNG backgrounds,
  replacing the v1.10 SVG scenes), v1.15 (richer felt art + custom
  background upload), v1.16 (landing subtitle centering fix), v1.17
  (two-tone backgrounds + 3 selectable styles), v1.18 (grew the style
  picker to 10 options, 50 PNGs total), v1.19 (**removed Overdose from
  the item pool — 23 items → 22 — and capped Patch Kit at one held**,
  see "Item system" in `FEATURES.md`), v1.20–v1.21 (multi-beat jump-scare
  sequence + HUD animation polish). All 9 are real commits on `main`
  (`ae9524f`..`1f9ec83`), all Claude-authored, all confirmed pushed to
  `origin/main` and live in production (`/changelog` + `/leaderboard`
  checked directly, 2026-08-07) — **but none of them were accompanied by
  a memory-file sync commit**, unlike every earlier version bump. This
  checkpoint is the catch-up. See `SESSION_LOG.md`'s top entry and
  `CHANGELOG.md` for the reconciliation record.
- **[Verified, 2026-08-17] Since the 2026-08-07 checkpoint above, 3 more
  real commits shipped but were never reconciled into this memory system
  or `src/lib/changelog.ts`** (which still stops at `"1.21"`): a
  `prefers-reduced-motion` accessibility fix (`97185d3`) and OpenGraph/
  robots.txt/sitemap metadata (`5816555`), both merged into `main`
  (`96a03e5`) and confirmed live in production via direct `curl`; plus a
  neon/glitch match-outcome headline effect (`42c03f9`), which was
  merged into `main` (`5be92bc`) and deployed **during this same
  checkpoint, by a different concurrent Claude Code session sharing this
  checkout** (not by this session, not confirmed to be the user
  directly) — see `PROJECT_STATE.md`'s "2026-08-17, continued" section.
  All 3 are now on `main`, fully pushed. Full detail: `PROJECT_STATE.md`'s
  2026-08-17 status, `TASKS.md` `TASK-010` (`T-010`) / `TASK-009` (now done).
- **Current blockers:** None.
- **Highest-priority next task:** None queued/urgent. `TASK-010`
  (`T-010`, add `src/lib/changelog.ts` entries for the 3 commits above)
  is open but not blocking — wait for user direction rather than
  starting it unprompted.

## Technology stack

Versions below are copied verbatim from `package.json` / config files —
not guessed.

- **Language:** TypeScript (`^5`, strict mode on in both tsconfigs)
- **Frontend framework:** Next.js `16.3.0` (App Router, Turbopack, React
  Server Components enabled via `components.json` `"rsc": true`)
- **UI runtime:** React `19.2.8` / React DOM `19.2.8`
- **Package manager:** npm (root `package-lock.json` present; no other
  lockfile in this repo)
- **Styling:** Tailwind CSS `^4` (via `@tailwindcss/postcss`), custom
  `oklch()` design tokens in `src/app/globals.css`, `tw-animate-css`
  `^1.4.0` for animation utilities
- **Component library:** shadcn/ui (`shadcn` CLI `^4.16.1`, style
  `radix-nova`, base color `neutral`), built on `radix-ui` `^1.6.7`
- **Icons:** `lucide-react` `^1.28.0`
- **Realtime backend runtime:** Cloudflare Workers, via
  [`partyserver`](https://github.com/threepointone/partyserver) `^0.5.10`
  (a Durable Object framework in the PartyKit lineage)
- **Client transport:** [`partysocket`](https://www.npmjs.com/package/partysocket)
  `^1.3.0` (`usePartySocket` React hook)
- **"Database":** Cloudflare Durable Object SQLite storage
  (`this.ctx.storage`), one instance per game room + one global instance
  for the leaderboard. **Not** a relational/document database — see
  `DATABASE.md`.
- **ID generation:** `nanoid` `^6.0.1` (reconnect tokens, log entry IDs,
  and — via `customAlphabet` — human-friendly room codes)
- **State management:** Component-local React state + one custom hook
  (`useGameRoom`) wrapping the WebSocket connection. No global store —
  `zustand` was a dead, unused dependency and has been removed
  (2026-08-06).
- **Hosting — frontend:** Vercel (project `chamber-seven`, org
  `garywangsmes-8349s-projects`; linked via `.vercel/project.json`)
- **Hosting — backend:** Cloudflare Workers, deployed with `wrangler`
  `^4.118.0` (`wrangler.jsonc` config)
- **Auth provider:** None. No login system exists anywhere in the repo.
  Identity is a free-text display name typed into `localStorage`
  (`chamber-seven:name`) plus a per-seat random reconnect token
  (`nanoid(24)`) also stored in `localStorage`. See `SECURITY.md`.
- **Analytics:** None found in the repo.
- **Payments:** None found in the repo.
- **Email provider:** None found in the repo.
- **Testing libraries:** **None installed.** No Jest/Vitest/Playwright in
  `package.json`. Ad hoc `npx playwright` scripts have been used
  out-of-repo (in a scratch/tmp directory) during development sessions to
  drive the real UI in a real browser, but nothing is committed to this
  repo and no test command exists. See `TESTING.md`.
- **Build tools:** Next.js/Turbopack (`next build`), `wrangler` (Worker
  bundling/deploy), `concurrently` `^10.0.4` (runs both dev servers
  together)
- **Linting:** ESLint `^9`, flat config (`eslint.config.mjs`), extends
  `eslint-config-next` `16.3.0` (`core-web-vitals` + `typescript` rule sets)
- **Formatting:** No Prettier config, no format script in `package.json`.
  Formatting is whatever ESLint enforces plus editor defaults.
- **External APIs:** None. The app is fully self-contained (no third-party
  API calls from client or Worker code, aside from Google Fonts loaded via
  `next/font/google` at build time).

## Essential commands

All commands run from the repository root (`~/Projects/chamber-seven`) —
there is no monorepo/workspace split to worry about.

```bash
npm install                # install dependencies

npm run dev                # Next.js dev server only — http://localhost:3000
                            # (falls back to 3001, 3002... if 3000 is busy,
                            # e.g. another project's dev server already has it)
npm run dev:party           # Worker dev server only (wrangler dev) — http://localhost:8787
npm run dev:all             # BOTH of the above together (concurrently) — use this normally

npm run build                # next build — production build of the frontend
npm start                   # next start — serve the production build locally

npm run lint                 # eslint (flat config, no --fix by default)
npm run typecheck            # tsc --noEmit — the Next.js app project
npm run typecheck:party      # tsc --noEmit -p party/tsconfig.json — the Worker project
                              # MUST run both typecheck commands; they are separate
                              # TypeScript projects with different lib/global scopes.

# No test command exists (npm test is not defined). See TESTING.md.

npm run deploy:party         # wrangler deploy — deploys the Worker to Cloudflare
                              # (equivalent to `npx wrangler deploy`)
npx vercel deploy --prod     # deploys the frontend to Vercel production
                              # (not an npm script; run directly)
```

There is no database migration/seed/reset command — Durable Object storage
has no schema migrations beyond the two `wrangler.jsonc` SQLite-class
migration tags already applied (see `DATABASE.md`). There is no
codegen/type-generation step beyond Next.js's own `.next/types` (automatic,
not something you run manually) and `worker-configuration.d.ts` (generated
by `wrangler types`, already committed — see `DEPLOYMENT.md` if it ever
needs regenerating).

## Repository structure

```
chamber-seven/
├── party/                   # Cloudflare Worker source (separate TS project)
│   ├── game.ts               # Worker entrypoint: `Main` Durable Object (per-room
│   │                          # game logic over WebSocket) + HTTP fetch handler
│   │                          # (CORS + /leaderboard route)
│   ├── leaderboard.ts        # `Leaderboard` Durable Object (global win counter)
│   └── tsconfig.json         # Worker's own strict TS config; excluded from the
│                              # root tsconfig so Workers runtime types never leak
│                              # into the Next.js app, and vice versa
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx            # Landing page: name entry, host/join/vs-AI/career cards
│   │   ├── layout.tsx           # Root layout: fonts, theme-init script, TooltipProvider
│   │   ├── globals.css          # ALL design tokens, theme presets, keyframes (see UI_SYSTEM.md)
│   │   ├── room/[roomId]/page.tsx  # Reads roomId + ?ai=1 + ?career=<id> query params, renders GameRoom
│   │   ├── career/page.tsx      # Career Mode hub: bot roster grid, rank/HP/items summary
│   │   ├── leaderboard/page.tsx # Fetches and renders the global leaderboard (client component)
│   │   ├── changelog/page.tsx   # Renders `src/lib/changelog.ts` as patch notes
│   │   ├── tutorial/page.tsx    # Rules + full item glossary (auto-generated from
│   │   │                        # ALL_ITEM_IDS, so its count never needs manual updating;
│   │   │                        # 22 items as of v1.19), grouped by category
│   │   └── lessons/page.tsx     # Strategy tips tied to the actual mechanics
│   ├── components/
│   │   ├── game/               # All game-specific UI (one component per concern —
│   │   │                        # see FILE_MAP.md for the full list and what each does)
│   │   └── ui/                 # shadcn/ui-generated primitives (avatar, badge, button,
│   │                            # card, dialog, input, progress, separator, tooltip).
│   │                            # Treat as vendor code — re-run the shadcn CLI to update
│   │                            # rather than hand-editing internals where possible.
│   ├── hooks/
│   │   ├── useGameRoom.ts       # THE client-server bridge: owns the WebSocket, exposes
│   │   │                        # {seat, state, connected, error, startGame, fireAt,
│   │   │                        # useItem, rematch, leave}
│   │   └── useLocalStorage.ts   # Generic localStorage-backed hook (useSyncExternalStore)
│   └── lib/
│       ├── game/                # THE shared rules engine — imported by BOTH the Worker
│       │   │                    # and the Next.js client. Single source of truth.
│       │   ├── types.ts           # All shared TypeScript types + the WS message protocol
│       │   ├── state.ts           # The entire game state machine (929 lines): settings
│       │   │                      # clamping, room/player creation, turn resolution, item
│       │   │                      # effects, redaction, and the bot AI
│       │   ├── items.ts           # Item catalog: draw weights, names/descriptions, weighted draw fn
│       │   ├── bots.ts            # Career Mode's 12-bot roster (name/skill/tier/color)
│       │   └── colors.ts          # Seat-color and item-category-color → Tailwind class lookups
│       ├── career.ts             # Client-side Career Mode progression (localStorage only)
│       ├── changelog.ts          # Patch notes data (edit this + bump version on every release)
│       ├── leaderboardApi.ts     # Builds the Worker's /leaderboard HTTP URL from env
│       ├── roomCode.ts           # Room code generation/validation (nanoid custom alphabet)
│       ├── themePresets.ts       # The 5 table-vibe theme definitions (id/name/emoji)
│       └── utils.ts              # `cn()` — clsx + tailwind-merge, shadcn boilerplate
├── public/
│   ├── backgrounds/            # 5 PNG skyline backgrounds, one per theme preset (bg-<id>.png)
│   ├── bots/                   # 12 PNG bot portraits, one per BOT_ROSTER entry (<id>.png)
│   ├── venues/                 # 6 PNG "tier" backdrop images — used as a layered background
│   │                            # behind the Career hub hero, escalating with the next
│   │                            # opponent's tier (wired up 2026-08-06; see career/page.tsx)
│   ├── career-hero.png         # Used — Career Mode page hero banner (roster silhouettes)
│   └── victory-burst.png       # Used — soft glow behind the level-up panel on match-end
│                                # (MatchEndView.tsx), wired up 2026-08-06
├── wrangler.jsonc              # Worker config: name, entrypoint, Durable Object bindings,
│                                # SQLite migration tags
├── worker-configuration.d.ts    # Generated by `wrangler types` — gitignored is FALSE
│                                # (currently committed); regenerate via `npx wrangler types`
│                                # if `Env`/bindings ever change. Excluded from ESLint via ignores.
├── components.json              # shadcn/ui config (style, aliases, icon library)
├── next.config.ts               # Currently empty — no custom Next.js config
├── eslint.config.mjs            # Flat ESLint config
├── tsconfig.json                # Next.js app TS project (excludes `party/`)
└── README.md                    # Human-facing overview — ⚠️ STALE, still describes the
                                   # game as "two-player" (pre-dates the 2-4 player FFA,
                                   # Career Mode, and team-mode expansions). Prefer this
                                   # memory system over README.md; update README.md when
                                   # convenient but it is not authoritative.
```

**What should NOT be placed where:**
- Do not put Worker-only code (anything using Cloudflare-specific globals,
  `cloudflare:workers` imports, or Durable Object APIs) inside `src/` —
  it's outside `party/tsconfig.json`'s scope and will not typecheck against
  Workers runtime types. Only `src/lib/game/**` is shared and must stay
  environment-agnostic (no `window`, no `document`, no Node/Workers-only
  APIs).
- Do not put React/Next.js-only code inside `party/` — it's excluded from
  the root `tsconfig.json` and has no React types available.
- Do not add new top-level state stores — there is no Redux/Zustand
  store in active use; game state flows through `useGameRoom`'s React
  state, and everything else is either `localStorage` or component state.

## Architecture summary

See `ARCHITECTURE.md` for the full write-up with a Mermaid diagram. Short
version:

- **One authoritative Durable Object per room** (`Main`, in `party/game.ts`)
  holds the *entire* real game state (`RoomState`, `src/lib/game/types.ts`),
  including hidden information (the real shell order, every player's real
  hand). It is the only place game logic executes — clients never compute
  outcomes locally.
- Clients connect over WebSocket via `partysocket`. Every state broadcast
  is **redacted per-recipient** (`redact()` in `src/lib/game/state.ts`) before being
  sent, so a given player's browser never receives another player's hidden
  hand or the unrevealed shell order — this is enforced server-side, not
  just hidden in the UI.
- The **same TypeScript module** (`src/lib/game/state.ts` and friends) is
  imported by both the Worker (for real authority) and the Next.js client
  (currently only for constants/types/settings-clamping on the settings
  form — the client never re-derives game outcomes).
- **Bots run inside the Durable Object**, not the client: after any state
  change, `runBotIfNeeded()` loops `runBotStep()` with a randomized delay
  between each micro-action, broadcasting state after every step so bot
  turns appear to "type" in real time to connected humans.
- **No conventional database.** Each room's state is one JSON blob in that
  room's Durable Object SQLite storage (`ctx.storage.get/put("room")`).
  There is no cross-room querying, no relations, no indexes — see
  `DATABASE.md`.
- **Persistence outside the Worker is `localStorage` only:** display name,
  theme choice, Career Mode progress (defeated bot IDs), and per-room
  reconnect tokens. None of it is server-validated beyond the reconnect
  token (which the Worker does check against the room's stored player
  tokens).

## Coding conventions

These are **Verified** (observed consistently across the existing
codebase) unless marked Inferred/Recommended.

- **Naming:** `camelCase` for functions/variables, `PascalCase` for React
  components and TypeScript types/interfaces, `SCREAMING_SNAKE_CASE` for
  module-level constants (`DEFAULT_SETTINGS`, `BOT_STEP_LIMIT`,
  `ALL_ITEM_IDS`). File names match their default export's name
  (`PascalCase.tsx` for components, `camelCase.ts` for plain modules).
- **File organization:** One component per file under
  `src/components/game/`; shared game logic centralized in
  `src/lib/game/` rather than duplicated per-caller. Small, single-purpose
  files are strongly preferred over large ones — the one outlier is
  `src/lib/game/state.ts` (929 lines) which is intentionally kept as one
  file because it's the single authoritative state machine and is shared
  verbatim between two runtimes.
- **Imports:** Path alias `@/*` → `src/*` (configured in `tsconfig.json`
  and `components.json`) used everywhere in `src/`. `party/` imports from
  `../src/lib/game/...` with relative paths (it's outside the `@/` alias's
  scope, and `party/tsconfig.json` doesn't define one).
- **Components:** Function components only, no class components. Client
  components explicitly marked with `"use client"` at the top; Server
  Components are the default (most `src/app/*/page.tsx` are Server
  Components except where they need hooks/localStorage/websockets, in
  which case they're `"use client"`).
- **Hooks:** Custom hooks in `src/hooks/`, prefixed `use*`. Prefer
  `useSyncExternalStore` for localStorage-backed reactive values over ad
  hoc `useEffect` + `useState` (see `src/hooks/useLocalStorage.ts`) to avoid
  hydration mismatches.
- **API routes / server actions:** None exist — there is no
  `src/app/api/` directory. All server logic lives in the Worker
  (`party/`), reached over WebSocket, plus one plain HTTP `fetch` handler
  for `/leaderboard` (see `API_REFERENCE.md`). If a future feature needs a
  Next.js API route, there is no existing convention to follow — decide
  deliberately and document it.
- **Game/state logic:** All game-rule mutations happen through named
  functions in `src/lib/game/state.ts` that take `(room: RoomState, ...)` and mutate
  `room` in place, returning an `ActionResult` (`{ok:true}` or
  `{ok:false,error:string}`) for player-triggered actions. Never mutate
  `RoomState` from a React component or from `party/game.ts` directly —
  always go through a `src/lib/game/state.ts` function.
- **Validation:** All player input (settings, target seat, item choice) is
  validated/clamped server-side in the Worker (`clampSettings()`,
  target/turn/phase checks inside `fire()`/`playItem()`) — the client-side
  validation (e.g. disabling buttons) is a UX convenience only, never
  trusted as the real gate.
- **Types:** `strict: true` in both `tsconfig.json`s. Discriminated unions
  used for the WS protocol (`ClientMessage`/`ServerMessage` in
  `src/lib/game/types.ts`) and for `ActionResult`. Prefer exhaustive `switch` over
  `if/else` chains when branching on an `ItemId`/`TeamMode`-like union.
- **Styling:** Tailwind utility classes inline in JSX; `cn()`
  (`src/lib/utils.ts`) for conditional class composition. Per-seat and
  per-item-category colors are **not** built via template strings — they're
  static object lookups (`COLOR_TEXT`, `COLOR_BORDER`, etc. in
  `src/lib/game/colors.ts`) specifically so Tailwind's JIT class scanner
  can find every class name at build time (a template string like
  `` `text-${color}` `` would silently fail to generate CSS). **Follow this
  pattern for any new per-token color mapping.**
- **Error handling:** Game actions return `ActionResult` rather than
  throwing; the Worker forwards `{type:"error", message}` to the
  requesting client only (never broadcast). Client-side, `useGameRoom`
  surfaces the latest error string for 4 seconds via a timeout-based
  `useEffect`.
- **Async logic:** Bot turns use real `setTimeout`-based delays
  (`botActionDelayMs()`, 550–1050ms) between micro-actions specifically so
  bot play is legible to a human watching — do not "optimize" this away.
- **Comments:** Sparse, and only where a decision's *why* isn't obvious
  from the code (e.g. the `ITEM_POOL_WEIGHTS` inline comment explaining
  why Irons is deliberately underweighted). No file has a top-of-file
  docblock; a few exported functions have a one-line JSDoc when their
  contract is non-obvious.
- **Tests:** None exist. No test-writing convention has been established
  — see `TESTING.md` for what verification currently substitutes for
  tests.

## UI and design system

Full detail in `UI_SYSTEM.md`. Key facts and exact file locations:

- **Design tokens:** `src/app/globals.css`, defined as CSS custom
  properties in `oklch()` color space under `:root`, remapped into
  Tailwind's `@theme inline` block. Includes a 5-hue qualitative palette
  (`--chart-1`..`--chart-5`) reused for both per-seat colors and
  per-item-category colors.
- **Theme system:** 5 selectable "table vibe" presets (Crimson Noir /
  default, Neon Tokyo, Emerald, Sapphire, Violet Dusk), defined in
  `src/lib/themePresets.ts`, applied via a `data-theme` attribute on
  `<html>`, persisted in `localStorage` (`chamber-seven:theme`), and
  flash-avoided via a `beforeInteractive` inline `<Script>` in
  `src/app/layout.tsx`. Each preset overrides `--bg-image` to a matching PNG in
  `public/backgrounds/`. **This is a light/dark-independent color-vibe
  picker, not a light-mode/dark-mode toggle** — the app is hardcoded dark
  (`className="... dark"` on `<html>` in `src/app/layout.tsx`); there is no light
  mode.
- **Typography:** `Geist` (sans), `Geist Mono` (mono), `Bebas Neue`
  (`--font-display`, used for big headline text) via `next/font/google` in
  `src/app/layout.tsx`.
- **Radius/spacing/shadows:** Tailwind defaults plus a custom `--radius`
  scale (`--radius-sm` through `--radius-4xl`, all derived from one
  `--radius: 0.5rem` base) in `src/app/globals.css`.
- **Icon system:** `lucide-react` exclusively. Per-item icons mapped in
  `src/components/game/itemIcons.tsx` (`ITEM_ICONS: Record<ItemId,
  LucideIcon>`) — every new `ItemId` needs an entry here.
- **Reusable components:** `src/components/ui/*` (shadcn primitives) +
  `src/components/game/*` (game-specific, see `FILE_MAP.md`).
- **Custom animated asset:** `src/components/game/DealerAvatar.tsx` is a hand-authored inline
  SVG (not a raster image) with CSS-keyframe idle sway and a
  React-prop-driven firing/recoil animation — used for every bot seat's
  avatar in the lobby, HUD, and while playing.
- **Accessibility:** No explicit ARIA audit has been done. Buttons/roles
  rely on native semantics (shadcn's underlying Radix primitives provide
  some baseline a11y for dialogs/tooltips). No documented a11y testing.
- **Responsive design:** Tailwind responsive prefixes (`sm:`, etc.) used
  ad hoc per component; no documented breakpoint strategy beyond
  Tailwind's defaults.

## Environment setup

**All environment variables found in this repo:**

| Variable | Purpose | Required? | Where used | Client/Server | Format | Example (safe) | Sensitive? |
|---|---|---|---|---|---|---|---|
| `NEXT_PUBLIC_PARTYKIT_HOST` | Host (no protocol) the client connects the WebSocket to, and that the leaderboard HTTP fetch is built from | Required for the client to reach a Worker at all (falls back to `127.0.0.1:1999` in `src/hooks/useGameRoom.ts` / `127.0.0.1:8787` in `src/lib/leaderboardApi.ts` — **the two fallback defaults are inconsistent**, see `SECURITY.md`/known issues) | `src/hooks/useGameRoom.ts`, `src/lib/leaderboardApi.ts` | Client (must be `NEXT_PUBLIC_*` to be exposed) | `host:port`, no `http(s)://` prefix, e.g. `127.0.0.1:8787` locally or `chamber-seven.<subdomain>.workers.dev` in production | `127.0.0.1:8787` | No — it's a public hostname, not a secret |
| `VERCEL_OIDC_TOKEN` | Vercel-internal OIDC token, auto-injected by the Vercel CLI/platform | Not something you set manually | Present in `.env.local`, not read by any app code found in this repo | Server (build/runtime injected) | Opaque token | — | **Yes** — do not commit or print its value |

No other environment variables were found (no `.env.example` existed
before this audit — one has been created; see below). `.env.local` is
already gitignored (`.env*` pattern in `.gitignore`).

**A `.env.example` has been created at the repo root** with placeholders
for `NEXT_PUBLIC_PARTYKIT_HOST` only (`VERCEL_OIDC_TOKEN` is
platform-injected, not something a new developer sets).

## Database summary

There is no relational or document database. See `DATABASE.md` for full
detail. In short: two Durable Object classes (`Main` — one instance per
room, `Leaderboard` — one single global instance), each storing one plain
JS object per storage key via the Durable Object SQLite storage API. No
migrations beyond the two `wrangler.jsonc` `new_sqlite_classes` tags
already applied. No row-level security (there is no SQL). No indexes (no
querying — each DO reads its one stored blob in full).

## Authentication and authorization

**There is no authentication system.** No signup, no login, no password,
no OAuth, no sessions in the conventional sense. See `SECURITY.md` for the
full analysis. Summary:

- "Identity" is a free-text name typed on the landing page, stored in
  `localStorage["chamber-seven:name"]`.
- Reconnecting to a specific seat in a specific room uses a random
  `nanoid(24)` token minted per-seat by the Worker and stored in
  `localStorage["chamber-seven:token:<roomId>"]`. This is the only
  server-checked "credential" in the app, and it only proves "you are the
  same browser that first claimed this seat," not any real identity.
- There are no roles/permissions beyond "host seat" (`hostSeat`, always
  `p1`, whoever created the room) vs. everyone else — the only
  host-specific behavior is that the host's `join` message is the one
  allowed to set the room's `GameSettings` (`state.settingsLocked` gates
  this to a single write).
- The leaderboard is keyed by lowercased display name with **no ownership
  check whatsoever** — anyone can inflate or collide with any name they
  type in. See `SECURITY.md`.

## API and integrations

Full detail in `API_REFERENCE.md`. There is no REST/GraphQL API in the
conventional sense — the entire game protocol is a WebSocket message
schema (`ClientMessage`/`ServerMessage` unions in `src/lib/game/types.ts`)
served by the `Main` Durable Object via `partyserver`'s routing. The only
plain HTTP endpoint is `GET /leaderboard` (CORS-open, `party/game.ts`
default export `fetch` handler), backed by the `Leaderboard` Durable
Object. No external third-party APIs, no webhooks, no SDKs, no service
accounts, no rate limiting anywhere.

## Testing and verification

No automated tests exist. See `TESTING.md` for the manual smoke-test
checklist and the ad hoc Playwright-driven verification process used
during development (not committed to the repo — run from a scratch
directory when needed). Before considering any change "done":

```bash
npm run typecheck
npm run typecheck:party
npm run lint
npm run build
```

All four currently pass cleanly on the working tree as of this audit
(2026-08-06), including the uncommitted team-mode changes. A production
build succeeding does **not** mean the feature works at runtime — see
`PROJECT_STATE.md` for what's actually been runtime-verified.

## Deployment

Full detail in `DEPLOYMENT.md`. Summary:

- **Frontend:** Vercel, project `chamber-seven`
  (`garywangsmes-8349s-projects` org), deployed via `vercel deploy --prod`.
  Production URL: `https://chamber-seven-omega.vercel.app`.
- **Backend:** Cloudflare Worker, deployed via `npx wrangler deploy`
  (`wrangler.jsonc` — name `chamber-seven`, entry `party/game.ts`, two
  Durable Object bindings `Main` and `LEADERBOARD`). Exact
  `*.workers.dev` subdomain is **Unverified** from within this repo
  (Cloudflare account-level setting, not stored in any file) — check the
  live `NEXT_PUBLIC_PARTYKIT_HOST` value on Vercel to confirm.
- Deploying the frontend and the Worker are **two independent commands**
  with no CI/CD automation tying them together — there is no GitHub
  Actions workflow in this repo. Whoever deploys must remember to run
  both when a change touches `src/lib/game/**` (shared by both).

## Critical rules — DO NOT CHANGE WITHOUT REVIEW

- **`src/lib/game/state.ts`, `src/lib/game/types.ts`, `src/lib/game/items.ts`** — the shared
  engine. A change here affects both the Worker (real games) and the
  client (settings validation). An incompatible change deployed to only
  one side (e.g. Worker updated, Vercel not redeployed, or vice versa)
  will desync the WS protocol and can break every in-flight room. Always
  deploy both sides together after touching these files.
- **`RoomState` / `RedactedState` shape (`src/lib/game/types.ts`)** — `redact()` is the
  only thing standing between a player's browser and another player's
  hidden hand / the real shell order. Any change to `redact()` or to what
  fields get added to `PlayerState` must be checked against what
  `redact()` actually exposes — a new sensitive field added to
  `PlayerState` is **not automatically safe**; it must be deliberately
  *excluded* from the mapping inside `redact()`, or it leaks to every
  client.
- **`wrangler.jsonc` `durable_objects.bindings` / `migrations`** — Durable
  Object class renames or migration-tag changes can orphan existing
  storage or fail to deploy. Do not rename `Main`/`Leaderboard` or edit
  existing migration tags; only ever *append* new migration entries.
- **`party/tsconfig.json` vs root `tsconfig.json` boundary** — do not make
  `party/` depend on anything outside `src/lib/game/**`, and do not let
  `src/` (outside `lib/game`) import anything Workers-specific. This
  boundary is what keeps both TypeScript projects typechecking
  independently.
- **`ITEM_POOL_WEIGHTS` (`src/lib/game/items.ts`) and the hand-cap/rarity logic in
  `src/lib/game/state.ts` (`canHoldAnother`, `HAND_CAP`, `DRAW_REROLL_ATTEMPTS`)** —
  these encode deliberate, previously-tuned game balance (e.g. Irons
  weighted at `0.5` vs. everything else `1.5`–`5`, capped at one held at a
  time; Scapegoat capped at one per match). Changing these numbers is a
  game-design decision, not a refactor — don't adjust "while touching
  something else" without it being the actual point of the change.
- **`GameSettings.teamMode` clamping logic in `clampSettings()`** — the
  invariant "`duos` requires exactly 4 players" and "`roundsToWin` is
  forced to 1 whenever `teamMode !== "none"`" is relied on by
  `assignTeams()`, `bossSeatOf()`, and the UI's conditional rendering
  (`src/components/game/GameSettingsForm.tsx`). Breaking this invariant server-side without
  updating all three call sites will desync team assignment from what the
  UI displays.
- **Leaderboard win-recording gate (`party/game.ts` `saveState()`,
  `state.winnerRecorded`)** — prevents double-counting a win if
  `saveState` runs more than once for the same `match_end` transition.
  Do not remove this guard without understanding why it's there.
- **Do not commit real secret values.** `.env.local` is gitignored;
  `.env.example` must stay placeholder-only.

## Known issues

See `PROJECT_STATE.md` and `FEATURES.md` for full detail per feature.
Headline items:

1. **RESOLVED — `public/venues/tier1.png`–`tier6.png` and
   `public/victory-burst.png` are now wired up.** As of 2026-08-06, the
   Career hub's hero banner layers in the tier-appropriate venue image
   (escalating with the next opponent's tier, `src/app/career/page.tsx`), and
   `victory-burst.png` provides a soft glow behind the level-up panel on
   the match-end screen (`src/components/game/MatchEndView.tsx`). The v1.7 changelog's claim
   is now actually true of the shipped UI. Verified via screenshot,
   both locally and against production.
2. **RESOLVED — Team modes (2v2 Duos, Boss Battle) are live and verified.**
   The earlier ambiguous Playwright text-matching evidence was resolved
   by a screenshot-based check (which sidesteps DOM-text-query timing
   issues entirely) — team badges, boss crown, exact HP/item scaling,
   and teammate-exclusion in targeting were all confirmed correct, in
   both modes, including a check run directly against **production**.
   Shipped as v1.8 on 2026-08-06. See `PROJECT_STATE.md`'s "TASK-002
   resolution" section for the full evidence and the (benign) root cause
   of the earlier contradictory results.
3. **RESOLVED — Inconsistent local dev fallback host.**
   `src/hooks/useGameRoom.ts` now defaults to `127.0.0.1:8787`, matching
   `src/lib/leaderboardApi.ts` and `wrangler dev --port 8787`.
4. **RESOLVED — `zustand` removed.** Re-confirmed unused via a fresh
   grep, then removed from `package.json`/`package-lock.json`
   (2026-08-06). Removing it surfaced 3 pre-existing `npm audit`
   findings (moderate/high) in `undici`, transitively via `wrangler`'s
   bundled `miniflare` — dev-only tooling, not part of the deployed
   Worker runtime. The automatic fix would force-downgrade `wrangler` by
   ~80 versions; **not applied**, judged too risky as a side effect of
   an unrelated cleanup. See `SECURITY.md` / `TASKS.md` → Technical debt.
5. **RESOLVED — README.md updated** to describe the current feature set
   (2–4 player FFA, vs-AI, Career Mode, team modes, leaderboard, themes)
   instead of the original 2-player-only description.
6. **No automated tests exist at all.** See `TESTING.md`. This is a gap,
   not a "broken" state, but it means every change is currently verified
   by typecheck/lint/build plus manual/ad hoc browser testing only.
   Still unresolved — no test framework was introduced in this session.
7a. **RESOLVED — the 9-commits-ahead-of-`origin/main` gap from the
    2026-08-06 checkpoint is gone.** Re-verified 2026-08-07 via a fresh
    `git fetch origin` + `git rev-list --left-right --count
    origin/main...main`: **0 ahead, 0 behind** — `main` is fully pushed
    and matches `origin/main` exactly (`1f9ec83`, v1.21). Everything from
    v1.8 through v1.21 is on GitHub. It is not recorded anywhere in this
    memory system *when* the push happened between the two checkpoints —
    only that it did, and that 9 more commits (v1.13–v1.21) were added
    and pushed since. See "Current status" above for the full version
    catch-up.
7. **RESOLVED — `.env.example` was silently gitignored.** `.gitignore`'s
   broad `.env*` pattern was matching `.env.example` too, which would
   have silently prevented it from ever being committed. Fixed during
   the 2026-08-06 checkpoint by adding a `!.env.example` negation line
   immediately after the `.env*` pattern. If you ever add another
   `.env.*`-style template file meant to be committed, remember to add a
   matching negation line, or it will silently vanish from `git add`
   the same way. **Re-confirmed still tracked and still holding as of
   2026-08-07** (`git ls-files` includes `.env.example`; `.gitignore`
   still has the `!.env.example` negation line immediately after `.env*`).
8. **NEW FINDING (2026-08-07) — the "update docs after every meaningful
   session" rule (see Permanent rules below) was not followed for 9
   consecutive shipped versions (v1.13–v1.21).** Every commit in that
   range is a real, Claude-authored, verified, pushed, deployed feature/
   fix commit — the product work itself was done correctly — but none of
   them touched `CLAUDE.md`/`PROJECT_STATE.md`/`TASKS.md`/`SESSION_LOG.md`/
   `CHANGELOG.md`/`FEATURES.md`, so this memory system silently drifted 9
   versions out of date (including one real cross-file factual
   contradiction: `README.md`/`FEATURES.md`/`HANDOFF.md` all still said
   "23 items" and README even named "Overdose" as an existing item, after
   v1.19 removed it). This checkpoint (2026-08-07) is the reconciliation.
   **Lesson for future sessions: even a single-purpose, user-directed
   "ship this one small fix" session should still touch `SESSION_LOG.md`
   at minimum** — a one-line append costs almost nothing and prevents
   exactly this kind of multi-version drift from accumulating silently.
9. **NEW FINDING (2026-08-17) — the exact same drift pattern recurred,
   AND this repo's checkout is shared across concurrent sessions.**
   Three more real commits shipped between 2026-08-13 and 2026-08-15
   (`97185d3` reduced-motion fix, `5816555` OG/robots/sitemap metadata,
   `42c03f9` neon/glitch match-outcome headline effect) with no
   accompanying memory-file update and no `src/lib/changelog.ts` entry.
   Additionally, this checkpoint found the repo checked out on
   `chore/polish` (one commit — `42c03f9` — ahead of `main`, unmerged)
   rather than `main`, and opened `TASK-009` to ask the user about it —
   **but while this same checkpoint was still writing documentation, a
   different, concurrent Claude Code session sharing this checkout
   merged `chore/polish` into `main` (`5be92bc`) and deployed it,
   without this session doing anything to cause it.** This repo's
   working directory is apparently shared across concurrent sessions/
   windows the same way `~/Projects/yuuki-outreach` is documented to be
   (see that project's own memory notes, outside this repo) — **branch/
   HEAD state can change mid-session here, not just in yuuki-outreach.**
   Reconciled this checkpoint (including the mid-checkpoint branch
   change): see `PROJECT_STATE.md`'s 2026-08-17 status (both the
   original finding and the "continued" post-merge re-verification),
   `FEATURES.md` (2 new entries), `UI_SYSTEM.md` (Accessibility
   additions), `TASKS.md` `TASK-009` (done)/`TASK-010` (open). **Lesson
   repeats: lesson #8 above was written specifically to prevent
   documentation drift, and it still happened** — the one-line-
   `SESSION_LOG.md`-append habit did not stick across account/session
   boundaries. Consider this a two-time pattern, not a one-off. **New
   lesson: any future session in this repo should re-check `git branch
   --show-current` and `git log -1` right before finishing/committing,
   even if it checked at the start** — this session's own experience is
   the proof that it can change in between.

## Recurring workflow: "account-switch checkpoints"

This user periodically requests a structured, explicit checkpoint before
a repository changes hands between AI sessions/accounts — phrased as
things like "final account-switch checkpoint" or a full documentation/
handoff audit. When asked for this (recognize it by the request asking
you to inspect git state, update the memory files, and confirm
consistency/no-secrets before a handoff — even if not phrased with
these exact words), the expected shape is:

1. Actually re-run `git status`/`git log`/`git diff --stat` — don't
   assume the last-known state is still current.
2. Update `PROJECT_STATE.md` with the exact current state (not a vague
   restatement — exact file lists, exact commit hashes).
3. Update `TASKS.md`'s current/active task with an explicit structure:
   objective, what's completed, what remains, relevant files, known
   errors, blockers, acceptance criteria, verification steps — as
   separate, clearly-labeled fields, not prose that implies them.
4. Update `HANDOFF.md` with the exact resume point.
5. Append (never overwrite) a new dated entry to `SESSION_LOG.md`.
6. Update `CLAUDE.md` itself if anything about architecture, workflow,
   restrictions, or conventions emerged that isn't already recorded
   (this section is itself an example of that).
7. Update any other memory file the session's work actually affected.
8. Re-scan the conversation for decisions/preferences/rejected ideas
   that only exist in chat, not in code, and write them down somewhere
   durable.
9. Re-verify no secrets/tokens/real env values are anywhere in the
   documentation.
10. Re-verify the current task is described **consistently** across
    `CLAUDE.md`, `PROJECT_STATE.md`, `TASKS.md`, and `HANDOFF.md` —
    these four files describing the same task differently is itself a
    bug to fix.
11. Unless explicitly instructed otherwise, this is a **read-and-
    document** pass: do not commit, push, deploy, reset, or change
    application behavior — the one standing exception observed so far
    is a pure repo-hygiene fix directly required for the documentation
    itself to work correctly (e.g. the `.gitignore`/`.env.example` fix
    above), not a product-behavior change.

The user has now requested this pattern twice in immediate succession
(once as a from-scratch audit, once as a tightening follow-up
checkpoint) — treat it as an established, repeatable process, not a
one-off.

## AI working instructions

Future Claude Code sessions (or any AI agent) working in this repo must:

1. Read `CLAUDE.md` (this file).
2. Read `PROJECT_STATE.md`.
3. Read `TASKS.md`.
4. Read whichever of `ARCHITECTURE.md` / `FEATURES.md` / `API_REFERENCE.md`
   / `DATABASE.md` / `UI_SYSTEM.md` / `SECURITY.md` / `DEPLOYMENT.md` is
   relevant to the task at hand.
5. Inspect the affected code directly before changing it — do not trust
   a memory file's description of a function's exact behavior over
   reading the function itself; memory files can go stale.
6. Check `git status` before modifying files (there may be uncommitted
   work in progress — as of this audit there is, see `PROJECT_STATE.md`).
7. Avoid overwriting unrelated work.
8. Make small, reviewable changes.
9. Run `npm run typecheck && npm run typecheck:party && npm run lint &&
   npm run build` after changes touching `src/` or `party/`.
10. Update documentation after meaningful changes (see the permanent
    rules below).
11. Never claim something works without verification — "it typechecks"
    is not the same claim as "it works in the browser." Say which one you
    mean.
12. Never expose secrets (`.env.local` values, `VERCEL_OIDC_TOKEN`, etc.)
    in output, commits, or documentation.
13. Never modify production data (the deployed Durable Object storage —
    live rooms, the live leaderboard) without explicit user permission.
14. Never perform destructive database/storage operations (there is no
    "reset" tooling for Durable Object storage in this repo; deleting a
    Durable Object's storage is effectively irreversible) without
    explicit permission.
15. Never silently replace an existing architectural pattern (e.g.
    switching state management, introducing a real database, adding
    auth) with a new one without it being the explicit point of the task.
16. Never remove a dependency without checking all usages first with a
    fresh repo-wide search, not by trusting this file's history (e.g.
    `zustand` was confirmed unused and removed on 2026-08-06 — a
    correctly-verified example of this rule, not an exception to it).
17. Never change authentication (there isn't one — adding one is a big
    decision), the Durable Object schema/bindings, deployment
    configuration, or the WS protocol shape casually — these are listed
    under "DO NOT CHANGE WITHOUT REVIEW" above.
18. Record unresolved uncertainty in the relevant memory file rather than
    guessing and presenting a guess as fact.

## Permanent rules for future development

**After every meaningful coding task:**

1. Update `PROJECT_STATE.md` with the new exact stopping point.
2. Update `TASKS.md` (move/close tasks, add new ones discovered).
3. Append an entry to `SESSION_LOG.md` (do not overwrite prior entries).
4. Update whichever of `FEATURES.md` / `ARCHITECTURE.md` /
   `API_REFERENCE.md` / `DATABASE.md` / `TESTING.md` / `DEPLOYMENT.md` /
   `SECURITY.md` is affected by the change.
5. Remove or correct stale information you notice, even if unrelated to
   your task — but note what you changed and why in `SESSION_LOG.md`.
6. Record meaningful architectural decisions in `DECISIONS.md`.
7. Run the verification commands listed above.
8. Clearly record anything not verified (e.g. "typechecks but not
   runtime-tested") rather than implying full verification.
9. Treat this repository's memory files as the permanent source of
   project memory — do not rely on chat history surviving to the next
   session.

**Before every meaningful coding task:**

1. Read `CLAUDE.md`.
2. Read `PROJECT_STATE.md`.
3. Read `TASKS.md`.
4. Read the relevant technical documentation file(s).
5. Run `git status` and `git diff --stat`.
6. Inspect the specific files you're about to change.
7. Confirm the requested work isn't already done (check `TASKS.md`
   "Recently completed" and the actual code).
8. Preserve unrelated work — don't `git checkout`/`reset`/`clean` without
   first stashing or confirming with the user, per the standing git
   safety rules already in effect for this environment.
9. Identify risks before modifying anything listed under "DO NOT CHANGE
   WITHOUT REVIEW" above.
