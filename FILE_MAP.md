# FILE_MAP.md — Practical Repository Map

Only files a future coding agent is likely to read or modify are listed.
Generated/vendor files (`node_modules`, `.next`, `.wrangler`,
`worker-configuration.d.ts`, `tsconfig.tsbuildinfo`) are omitted except
where noted.

## Core game engine (`src/lib/game/`)

### `src/lib/game/types.ts`
- **Purpose:** Every shared TypeScript type: `ShellType`, `ItemId` (23-way
  union), `SeatId`/`ALL_SEATS`, `GamePhase`, `TeamMode`, `GameSettings`,
  `PlayerState` (full/authoritative), `RoomState` (full room),
  `RedactedPlayer`/`RedactedState` (per-recipient safe view), and the
  `ClientMessage`/`ServerMessage` WebSocket protocol unions.
- **Imported by:** almost everything in `src/lib/game/`, `party/game.ts`,
  most of `src/components/game/`, `src/hooks/useGameRoom.ts`.
- **Imports:** nothing (leaf type module).
- **Edit when:** adding a new item, a new settings field, a new player
  state flag, or changing the WS message protocol.
- **Risk:** High. Adding a field to `PlayerState` does **not**
  automatically make it safe to expose to clients — it must be
  deliberately added (or deliberately *not* added) to `RedactedPlayer`
  and to the mapping inside `redact()` in `state.ts`. Changing the
  `ClientMessage`/`ServerMessage` shape requires redeploying both the
  Worker and the frontend together (see `CLAUDE.md` → Critical rules).

### `src/lib/game/state.ts` (~940 lines — the engine)
- **Purpose:** The entire game state machine. Settings clamping
  (`clampSettings`), room/player creation (`createRoom`, `makePlayer`),
  seat/team helpers (`activeSeats`, `aliveActiveSeats`, `bossSeatOf`,
  `assignTeams`, `isTeammate`, `roundOver`, and the exported pure
  `teamForSeatIndex()` that both `assignTeams()` and the lobby's
  client-side team preview call), turn resolution (`fire`,
  `passTurnFrom`, `nextAliveSeat`), the full item-effect switch
  (`applyItemEffect`, `playItem`), redaction (`redact`), and the bot AI
  (`runBotStep`, `botActionDelayMs`).
- **Imported by:** `party/game.ts` (for real game execution),
  `src/lib/career.ts`, `src/components/game/GameSettingsForm.tsx` (for
  `DEFAULT_SETTINGS`-adjacent constants — check current imports before
  assuming), and indirectly by any component needing `ItemId`/game
  constants.
- **Imports:** `nanoid`, `./items`, `./types`.
- **Edit when:** adding/changing an item's effect, adding a new game
  mode or settings field, changing turn/damage/elimination rules, tuning
  the bot AI's decision logic.
- **Risk:** Very high. This file is deployed to **both** targets. A
  logic bug here affects every live room. Always run both
  `npm run typecheck` and `npm run typecheck:party` after touching it —
  it's the one file both `tsconfig.json` projects compile.

### `src/lib/game/items.ts`
- **Purpose:** The 23-item catalog: `ITEM_POOL_WEIGHTS` (draw
  probability weights), `ALL_ITEM_IDS` (derived from the weights object's
  keys), `ITEM_INFO` (name/description/usable/requiresTarget per item),
  `weightedRandomItem()`.
- **Imported by:** `state.ts` (draws), `colors.ts` (categorization),
  every UI component that renders an item (`ItemCard.tsx`,
  `GameSettingsForm.tsx`, `MatchEndView.tsx`'s career reward panel).
- **Imports:** `./types`.
- **Edit when:** adding a brand-new item (also requires: an `ItemId`
  union entry in `types.ts`, an effect case in `state.ts`'s
  `applyItemEffect`, an icon in `itemIcons.tsx`, a category in
  `colors.ts`'s `ITEM_CATEGORY`, and a slot in `career.ts`'s
  `CAREER_ITEM_UNLOCK_ORDER`) or rebalancing draw weights.
- **Risk:** Medium. Rebalancing weights is a deliberate game-design
  change, not a casual edit — see `CLAUDE.md` → Critical rules.

### `src/lib/game/bots.ts`
- **Purpose:** Career Mode's 12-bot roster (`BOT_ROSTER`): id, display
  name, tagline, `skill` (0–1, feeds `GameSettings.botSkill`),
  `archetype` (cosmetic grouping, not currently used to select a distinct
  avatar shape — `DealerAvatar` is generic), `color`, `tier` (1–6,
  intended to group into career "venues" — see `FEATURES.md` for the
  unwired venue-image caveat). `botById()` lookup helper.
- **Imported by:** `src/app/career/page.tsx`, `src/lib/career.ts`,
  `src/components/game/GameRoom.tsx` (resolves `careerBotId` →
  `BotProfile` for the reward panel).
- **Risk:** Low-medium. Roster order **is** the career ladder order —
  reordering `BOT_ROSTER` changes ladder progression for anyone with
  existing `defeatedBotIds` progress (their unlocked-so-far bots would
  shift). Do not reorder without considering existing players'
  `localStorage` state.

### `src/lib/game/colors.ts`
- **Purpose:** `SEAT_COLOR` (seat → chart-token), `ITEM_CATEGORY` +
  `CATEGORY_COLOR` (item → category → chart-token), and static
  Tailwind-class lookup tables (`COLOR_TEXT`, `COLOR_BORDER`,
  `COLOR_BORDER_T`, `COLOR_BORDER_L`, `COLOR_BG_SOLID`, `COLOR_BG_SOFT`,
  `COLOR_RING`), all keyed by the 5 `chart-1`..`chart-5` tokens.
- **Edit when:** adding a new item (needs an `ITEM_CATEGORY` entry) or
  changing seat/category color assignments.
- **Risk:** Medium — these lookups are **static object literals on
  purpose** (see the comment in the file) so Tailwind's JIT scanner can
  find every class name at build time. Never refactor these into
  template-string class construction (e.g. `` `text-${token}` ``) — it
  will silently break styling in production (classes not generated) even
  though it typechecks fine.

## Client-server bridge

### `src/hooks/useGameRoom.ts`
- **Purpose:** The one hook owning the WebSocket connection
  (`usePartySocket`). Sends `join` on open (including any pending
  settings/vsAI/botName), tracks `seat`/`state`/`connected`/`error`,
  exposes `startGame`/`fireAt`/`useItem`/`rematch`/`leave` senders.
- **Imported by:** `src/components/game/GameRoom.tsx` only.
- **Edit when:** adding a new client→server message type, changing
  reconnect-token handling, changing how errors are surfaced.
- **Risk:** Medium-high — this is the only place the WS protocol is
  spoken from the client. A shape mismatch against `party/game.ts`'s
  `onMessage` switch breaks the app silently (messages get dropped by
  the `try { JSON.parse } catch { return }` guards on both ends).

### `party/game.ts`
- **Purpose:** Worker entrypoint. `Main` class: `getState`/`saveState`
  (Durable Object storage + leaderboard win-recording),
  `broadcastState`, the full `onMessage` switch (`join`, `start_game`,
  `fire`, `use_item`, `rematch`, `leave`), `runBotIfNeeded`, `onClose`
  (disconnect + reconnect-alarm), `onAlarm` (forfeiture). Also the
  default-exported `fetch` handler: CORS + `GET /leaderboard`.
- **Imports:** `partyserver`, `./leaderboard`, everything from
  `../src/lib/game/state` and `../src/lib/game/types`.
- **Edit when:** adding a new WS message type, changing
  reconnect/forfeit timing, changing leaderboard recording rules, adding
  a new HTTP route.
- **Risk:** Very high — this is the live production backend logic. See
  `CLAUDE.md` → Critical rules for the Durable Object binding/migration
  caveats.

### `party/leaderboard.ts`
- **Purpose:** `Leaderboard` Durable Object — `recordWin(name)`,
  `getTop(limit)`. Single global instance
  (`env.LEADERBOARD.idFromName("global")` in `game.ts`).
- **Risk:** Medium — see `SECURITY.md` for the no-ownership caveat before
  changing win-recording trust assumptions.

## Client-side persistence / progression

### `src/lib/career.ts`
- **Purpose:** Career Mode progression, entirely `localStorage`-backed
  (no server involvement): `CAREER_ITEM_UNLOCK_ORDER`,
  `loadCareer`/`saveCareer`/`recordCareerWin`, `careerLevel`,
  `unlockedItems`, `hpRangeForLevel`, `nextOpponent`, `isUnlocked`,
  `isCareerComplete`, `careerMatchSettings` (builds the `GameSettings`
  for a given career fight).
- **Imported by:** `src/app/career/page.tsx`,
  `src/components/game/GameRoom.tsx`.
- **Edit when:** changing HP/item progression curves, adding new
  unlockable items to the order.
- **Risk:** Medium — `CAREER_ITEM_UNLOCK_ORDER` reordering changes what
  existing players have already "earned" at their current level; treat
  like a save-compatibility concern.

## Next.js pages (`src/app/`)

### `src/app/page.tsx`
- **Purpose:** Landing page — name entry, "Host a Table" /
  "Join a Table" / "Face the Dealer" (vs AI) / "Career Mode" cards, each
  driving `createRoom()` which stashes `GameSettings` in
  `localStorage["chamber-seven:pending-settings"]` and navigates to
  `/room/<code>`.
- **Edit when:** changing the landing page's options, adding a new entry
  mode.

### `src/app/room/[roomId]/page.tsx`
- **Purpose:** Thin wrapper — reads `roomId`/`?ai=1`/`?career=<id>` and
  renders `GameRoom`.

### `src/components/game/GameRoom.tsx`
- **Purpose:** The real orchestrator for the in-room experience. Reads
  the stored name + pending settings, renders `ConnectedRoom` (which
  calls `useGameRoom` and switches between `Lobby` / `PlayingView` /
  `MatchEndView` based on `state.phase`), and owns the Career Mode
  win-recording side effect (`recordedRef` guard, `careerReward` state).
- **Risk:** Medium — the career-win-recording `useEffect` has a
  same-tab-only re-render guard (`recordedRef`); if this component
  remounts unexpectedly mid-match (e.g. a route change), the guard resets
  and a win could theoretically be recorded twice client-side (though
  `recordCareerWin` itself is idempotent per bot ID, so the practical
  impact is low).

### `src/app/career/page.tsx`, `src/app/leaderboard/page.tsx`,
`src/app/changelog/page.tsx`, `src/app/tutorial/page.tsx`, `src/app/lessons/page.tsx`
- **Purpose:** Self-contained pages for Career Mode hub, the global
  leaderboard (client-fetches `LEADERBOARD_URL`), rendered patch notes
  (reads `src/lib/changelog.ts`), the rules + item glossary
  (`tutorial/page.tsx`, generated from `items.ts`/`itemIcons.tsx`/
  `colors.ts` — never hand-duplicate item text here), and strategy tips
  (`lessons/page.tsx`, hand-written content in a local `LESSONS` array).
- **Edit when:** career hub layout changes; leaderboard display changes;
  **every release should add a new entry to `src/lib/changelog.ts`**,
  which the changelog page renders automatically — no page edit needed
  for a normal release. Adding a new `ItemId` automatically appears in
  `/tutorial`'s glossary with no edit needed there either — only add to
  `/lessons` if the new item changes recommended strategy.

### `src/app/layout.tsx` / `src/app/globals.css`
- **Purpose:** Root layout (fonts — `Barlow` body / `Butcherman` display
  / `Geist_Mono` mono, as of 2026-08-06 v1.10 — flash-free theme-init
  script, `TooltipProvider`) and **all** design tokens/theme
  presets/keyframes/utility classes. See `UI_SYSTEM.md`.
- **Risk:** Medium — `globals.css` is the single source of truth for
  every color token in the app; a change here is instantly global. Note:
  `--font-sans` must reference the actual font variable
  (`var(--font-body)`), not itself — a prior self-referential bug here
  silently broke body-text font rendering site-wide (fixed 2026-08-06,
  see `PROJECT_STATE.md`).

### `src/app/icon.tsx` / `src/app/apple-icon.tsx`
- **Purpose:** Next.js file-convention dynamic icon routes (`next/og`
  `ImageResponse`) — generate the browser-tab favicon and Apple
  home-screen icon at build time as a 7-chamber revolver cylinder with
  one shell lit red. Added 2026-08-06, replacing the unused default
  `favicon.ico` (deleted).
- **Risk:** Low — self-contained, no shared state.

## Game UI components (`src/components/game/`)

| File | Purpose | Risk notes |
|---|---|---|
| `GameSettingsForm.tsx` | The settings editor used by both "Host a Table" and "Play vs AI" dialogs. Owns player-count/team-mode/rounds/HP/items-per-reload/enabled-items controls and their cross-field invariants. | High — must keep its client-side invariants in sync with `clampSettings()` server-side, or the UI will show states the server will silently correct/reject. |
| `PlayerHud.tsx` | One player's row: animated avatar (`DealerAvatar` for bots, `PlayerAvatar` for humans — every seat gets one as of 2026-08-06, previously humans had none), team badge, boss crown, connection/elimination icons, health bar, item count, turn indicator. | Medium |
| `TargetSelector.tsx` | The row of target chips shown on your turn; excludes eliminated players and (in team modes) your own teammates. | Medium — must stay in sync with server-side `isTeammate()` targeting rules, or the UI will let you attempt an action the server then rejects. |
| `MatchEndView.tsx` | End-of-match screen: win/loss framing, career reward panel (now with a `victory-burst.png` glow on level-up), FFA standings or team-mode standings, rematch/leave or "back to career" actions. | Medium |
| `PlayingView.tsx` | The main in-round layout: opponent HUDs, chamber bar, event log, your HUD, target selector, hand, action bar. Derives the per-seat avatar firing animation cue from fresh log lines (`useDealerFx`) and the full-screen jump-scare cue (`useShootScare`, added 2026-08-06) from fresh LIVE-shot log lines. | Medium |
| `Lobby.tsx` | Pre-game waiting room: room code display, invite-link copy, player list (now with a team badge / boss crown preview via `teamForSeatIndex()`, see `state.ts`), "Start the Game" (disabled until everyone's connected). | Low |
| `ActionBar.tsx` | The big "Fire" button (self vs. target framing). | Low |
| `ItemCard.tsx` | One item in your hand — icon, name, tooltip description, click-to-use. | Low |
| `ChamberBar.tsx` | Visual pip row for remaining shells + the peeked-shell reveal. | Low |
| `EventLog.tsx` | Scrolling public + private log feed, titled "Table talk." Entries slide in on arrival (`table-talk-in`/`table-talk-in-private` keyframes, added 2026-08-06); only genuinely new lines animate (keyed by stable `entry.id`). | Low |
| `HealthBar.tsx` | Simple proportional HP bar. | Low |
| `DealerAvatar.tsx` | Hand-authored inline SVG bot avatar (hooded specter) with CSS-keyframe idle animation + prop-driven firing/recoil, via the shared `duel-avatar*` CSS classes (`globals.css`). | Low — purely cosmetic, self-contained. |
| `PlayerAvatar.tsx` | Hand-authored inline SVG human-player avatar (bare-headed, jacketed — vs. the dealer's hooded look), sharing `DealerAvatar`'s `duel-avatar*` animation classes and firing/aim prop API. Added 2026-08-06. | Low — purely cosmetic, self-contained. |
| `ShootScare.tsx` | Full-screen jump-scare overlay for a LIVE/damaging shot involving the local player — scaled-up avatar art, flash, screen-shake, auto-dismisses via `onDone`. Added 2026-08-06. | Low — purely cosmetic, self-contained; must call `onDone` or the overlay snaps back to fully visible after its CSS animation ends (no `fill-mode: forwards` set). |
| `BotCard.tsx` | Career Mode roster grid card (locked/current/defeated states). | Low |
| `ThemePicker.tsx` | Table-vibe picker dialog; writes `data-theme` + `localStorage`. | Low |
| `Flourish.tsx` | Decorative divider. | Trivial |
| `itemIcons.tsx` | `ItemId → LucideIcon` map. | Low — **must** get a new entry whenever a new `ItemId` is added, or that item renders with `undefined` as its icon component (a runtime error). |

## shadcn/ui primitives (`src/components/ui/`)

`avatar.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`,
`input.tsx`, `progress.tsx`, `separator.tsx`, `tooltip.tsx` — standard
shadcn-generated components (style `radix-nova` per `components.json`).
**Prefer regenerating/updating via the shadcn CLI over hand-editing**
where possible, to stay compatible with future shadcn updates; hand-edits
that have already been made (if any) are not tracked separately from
generated code in this repo.

## Configuration files

| File | Purpose | Risk |
|---|---|---|
| `wrangler.jsonc` | Worker name/entry, Durable Object bindings, SQLite migration tags. | High — see `CLAUDE.md` Critical rules. |
| `next.config.ts` | Currently empty (`{}`). | Low |
| `tsconfig.json` | Next.js app TS project; excludes `party/` and `worker-configuration.d.ts`. | Medium |
| `party/tsconfig.json` | Worker TS project; includes only `party/**` + `../worker-configuration.d.ts` + `../src/lib/game/**`. | Medium |
| `eslint.config.mjs` | Flat ESLint config extending `eslint-config-next`. | Low |
| `components.json` | shadcn/ui config (style, aliases, icon library). | Low |
| `package.json` | Scripts + dependencies. | Medium — see `zustand` unused-dependency note in `CLAUDE.md`. |
| `.env.local` | Local secrets/config (gitignored). | High — never commit. |
| `.env.example` | **New this audit** — placeholder template for `.env.local`. | Low |
| `worker-configuration.d.ts` | Generated by `wrangler types`. **Verified gitignored and untracked** (`.gitignore:44`; `git ls-files` confirms it is not committed) — present on disk locally but every clone must regenerate it. | Low — regenerate via `npx wrangler types` if `Env`/bindings change, don't hand-edit. If a fresh clone's `party/tsconfig.json` typecheck fails referencing missing `Env` types, this is why — run `npx wrangler types` first. |

## Where to make common changes

- **Change navigation:** header links live inline in each page
  (`src/app/**/page.tsx` — there is no shared `<Nav>` component; each
  page repeats its own header JSX). Add a new top-level page by creating
  `src/app/<route>/page.tsx` and adding a link wherever relevant
  (typically `src/app/page.tsx`'s footer links and/or each other page's
  header).
- **Add a page:** create `src/app/<route>/page.tsx`. No shared layout
  wrapper beyond `src/app/layout.tsx` (fonts/theme-init) exists — copy an
  existing simple page (e.g. `changelog/page.tsx`) for the header pattern.
- **Add an API route:** none exist yet. If needed, create
  `src/app/api/<name>/route.ts` following standard Next.js App Router
  conventions — there is no existing example to mirror in this repo.
- **Modify authentication:** there isn't one to modify — see
  `SECURITY.md` before adding one; this would be a significant new
  architectural decision, not a small change.
- **Change the database schema:** there is no schema — see `DATABASE.md`.
  To add a new stored field, add it to `RoomState` (or a new Durable
  Object storage key) in `types.ts`/`state.ts`/`party/*.ts`; no migration
  tooling exists beyond `wrangler.jsonc`'s `new_sqlite_classes` tags
  (only relevant if adding a brand-new Durable Object *class*, not a new
  field on an existing one).
- **Add a feature (new item):** `types.ts` (`ItemId` union) →
  `items.ts` (`ITEM_POOL_WEIGHTS`, `ITEM_INFO`) → `state.ts`
  (`applyItemEffect` case) → `itemIcons.tsx` (icon) → `colors.ts`
  (`ITEM_CATEGORY`) → `career.ts` (`CAREER_ITEM_UNLOCK_ORDER`, if it
  should be unlockable in Career Mode) → `changelog.ts` (new version
  entry).
- **Add a feature (new game mode):** extend `TeamMode` (or introduce a
  new settings dimension) in `types.ts`, wire it through
  `clampSettings`/`assignTeams`/`roundOver`/targeting checks in
  `state.ts`, add UI in `GameSettingsForm.tsx`, and surface any new
  per-player state in `redact()` + `RedactedPlayer` + the relevant UI
  components (`PlayerHud.tsx`, `TargetSelector.tsx`, `MatchEndView.tsx`).
  This is exactly the pattern the shipped v1.8 team-mode work followed
  — see `PROJECT_STATE.md` and `DECISIONS.md`.
- **Change themes:** `src/lib/themePresets.ts` (add a preset entry) +
  `src/app/globals.css` (add a matching `:root[data-theme="<id>"]`
  block) + a new `public/backgrounds/bg-<id>.svg` asset (SVG as of
  2026-08-06, replacing the original PNGs — see `UI_SYSTEM.md`).
- **Update deployment settings:** `wrangler.jsonc` (Worker) or the Vercel
  project's environment variables / project settings (frontend, not
  stored in this repo — see `DEPLOYMENT.md`).
- **Add an environment variable:** add it to `.env.example` with a
  placeholder, document it in `CLAUDE.md`'s Environment setup table, and
  (if server-only) read it via `process.env.X` in `party/game.ts` (also
  add it to `Env`/`worker-configuration.d.ts` if Worker-side — regenerate
  via `npx wrangler types` after adding a new binding/var to
  `wrangler.jsonc`) or (if client-visible) prefix it `NEXT_PUBLIC_` and
  read it via `process.env.NEXT_PUBLIC_X`.
- **Modify global styles:** `src/app/globals.css` only — there is no
  secondary stylesheet.
- **Update multiplayer behavior (turn order, elimination, reconnect):**
  `src/lib/game/state.ts` (turn/elimination logic) or `party/game.ts`
  (reconnect grace period, `RECONNECT_GRACE_MS`, imported from
  `state.ts`).
- **Modify scoring:** `src/lib/game/state.ts`'s `endRound()`
  (`roundWins`) and the `Leaderboard` Durable Object
  (`party/leaderboard.ts`, `recordWin`/`getTop`) for cross-match wins.
- **Change permissions:** there's effectively one permission check
  (`hostSeat` can set initial settings) — see `party/game.ts`'s `join`
  handler and `state.settingsLocked`.
