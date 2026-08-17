# FEATURES.md — Feature-by-Feature Status

Status classifications used: **Verified complete**, **Mostly complete**,
**Partially implemented**, **UI only**, **Backend only**, **Mocked**,
**Planned**, **Broken**, **Deprecated**, **Unable to verify**.

A feature is only called "Verified complete" if its full path — UI,
client logic, server logic, validation, error/loading/empty states where
applicable — was actually traced through the code (not just "the files
exist").

---

## Core duel engine (fire at self/others, live/blank chamber, damage)

- **Status:** Verified complete.
- **Purpose:** The base game loop — shared shotgun, hidden shell order,
  self/opponent targeting, HP-based elimination.
- **User flow:** Host or join a room → lobby → "Start the Game" →
  each turn: optionally use items, then fire at self or a target →
  round ends when only one seat (or, in team modes, one team) remains
  alive → match ends when a player reaches `roundsToWin` round wins.
- **Frontend:** `src/components/game/PlayingView.tsx`, `src/components/game/ActionBar.tsx`, `src/components/game/ChamberBar.tsx`,
  `src/components/game/TargetSelector.tsx`, `src/components/game/PlayerHud.tsx`, `src/components/game/HealthBar.tsx`.
- **Backend:** `party/game.ts` (`fire` message handler) →
  `src/lib/game/state.ts` (`fire()`, `resolveHit()`, `applyDamage()`,
  `passTurnFrom()`, `reload()`, `maybeReload()`).
- **Database dependency:** Durable Object storage (`Main`, key `"room"`)
  — the entire `RoomState` including `chamber: ShellType[]`.
- **Validation:** Server-side only — phase must be `"playing"`, must be
  the acting seat's turn, chamber must be non-empty, target must be a
  valid non-eliminated active seat, and (team modes) not a teammate.
- **Error states:** Invalid actions return `{ok:false, error}`, shown as
  a 4-second banner (`src/components/game/GameRoom.tsx`).
- **Loading states:** `Loader2` spinner while `!connected || !state ||
  !seat` in `ConnectedRoom` (`src/components/game/GameRoom.tsx`).
- **Edge cases handled:** empty chamber mid-round auto-reloads
  (`maybeReload`); Second Wind survives a lethal hit at 1 HP once;
  Riot Vest absorbs one hit; Scapegoat redirects one hit.
- **Tests:** None automated. Manually verified across many prior sessions
  per `CHANGELOG.md` history (each version bump implies working play).
- **Known issues:** None found in code review beyond what's listed under
  `PROJECT_STATE.md`/`CLAUDE.md` Known issues (which concern newer,
  uncommitted features, not this core loop).
- **Remaining work:** None identified for the base 2-player mechanic.

## N-player free-for-all (2–4 players)

- **Status:** Verified complete.
- **Purpose:** Extends the duel to up to 4 seats, elimination-based, last
  seat standing wins the round.
- **Frontend:** `src/components/game/GameSettingsForm.tsx` (player-count selector),
  `src/components/game/PlayingView.tsx`'s "others" grid (`sm:grid-cols-2`).
- **Backend:** `activeSeats()`, `aliveActiveSeats()`, `nextAliveSeat()`,
  `roundOver()` in `src/lib/game/state.ts`, all parameterized over
  `GameSettings.playerCount`.
- **Validation:** `clampSettings()` restricts `playerCount` to `2 | 3 |
  4`.
- **Edge cases:** turn order wraps correctly with any subset of seats
  eliminated (`nextAliveSeat`); Molotov/AOE items correctly target "every
  other active, non-eliminated seat."
- **Remaining work:** None identified.

## AI opponents / "Play vs AI" ("Face the Dealer")

- **Status:** Verified complete.
- **Purpose:** Solo play against 1–3 bots filling every seat but the
  host's.
- **User flow:** Landing page → "Play vs AI" → settings dialog (same
  `GameSettingsForm`, labeled "Table size (you + AI)") → "Start Match" →
  auto-navigates to a fresh room with `?ai=1`.
- **Frontend:** `src/app/page.tsx` (`aiOpen` dialog, `createRoom(...,
  true)`), `src/components/game/DealerAvatar.tsx` (bot avatar + firing animation),
  `src/components/game/PlayingView.tsx`'s `useDealerFx` (detects fresh "fires at" log lines
  from bot seats to trigger the animation cue).
- **Backend:** `party/game.ts`'s `join` handler
  (`fillRemainingSeatsWithBots` when `msg.vsAI && seat === hostSeat`),
  `src/lib/game/state.ts`'s `fillBotSeat`/`fillRemainingSeatsWithBots`,
  `runBotIfNeeded`/`runBotStep` (the actual bot decision logic, skill-
  gated via `GameSettings.botSkill`).
- **Validation:** Bots always fill non-host, non-connected seats only;
  `BOT_STEP_LIMIT` (25) caps a single bot-turn-chain to prevent runaway
  loops.
- **Edge cases:** A bot that draws a blank on itself keeps going (the
  loop continues until `isBotTurn` is false); bot skill affects *which*
  items it plays well, not whether it "forgets" already-peeked
  information (deliberately — see the comment in `runBotStep`).
- **Remaining work:** None identified for this mode itself. (Career Mode,
  below, is the deeper single-player system built on top of this.)

## Career Mode (12-bot ladder, progression)

- **Status:** Mostly complete — one internally-inconsistent detail (see
  below), otherwise fully wired end-to-end.
- **Purpose:** Single-player progression: beat the bot in front of you
  on the ladder to unlock a little more max HP and one new item,
  starting from a 3-item kit and ending with the full 22-item pool
  (was 23 before v1.19 removed Overdose — see "Item system" below).
- **User flow:** Landing page → "Career Mode" → hub page shows rank,
  HP range, items unlocked, and a 12-card bot grid (locked / current /
  defeated) → "Fight `<bot>`" → single-round vs-AI match at that bot's
  skill and the player's current HP/item unlocks → on win, `GameRoom`
  records the win to `localStorage` and shows a reward panel
  (level-up / new item, or "already beaten" if refought).
- **Frontend:** `src/app/career/page.tsx`, `src/components/game/BotCard.tsx`,
  `src/components/game/MatchEndView.tsx`'s career-reward panel.
- **Client logic:** `src/lib/career.ts` — entirely `localStorage`-based,
  no server involvement in progression itself (only the underlying match
  is a real server-authoritative vs-AI game).
- **Backend:** None specific to career progression — it reuses the
  ordinary vs-AI game path with settings built by `careerMatchSettings()`.
- **Database dependency:** None (client-only persistence).
- **Validation:** `isUnlocked()` gates which bots are fightable (must
  have beaten the previous one in `BOT_ROSTER` order); already-defeated
  bots remain fightable for practice (no reward on rematch).
- **Error/loading/empty states:** No explicit empty state needed (roster
  is static); no server round-trip for the hub page itself.
- **Edge cases:** `isCareerComplete()` — "Roster cleared" / "Legend" rank
  shown once every bot is defeated.
- **RESOLVED (2026-08-06):** the v1.7 changelog entry's claim of "6
  mood-lit venue backdrops that escalate from a dim back alley to a
  blood-red penthouse as you climb the ladder" is now actually true.
  `src/app/career/page.tsx` layers `public/venues/tier${venueTier}.png` (where
  `venueTier = nextOpponent(career)?.tier ?? 6`) behind the existing
  hero banner, so the backdrop escalates with the next opponent's tier
  and settles on the final (tier 6) venue once the roster is cleared.
  `public/victory-burst.png` now provides a soft celebratory glow behind
  the level-up panel on `src/components/game/MatchEndView.tsx`. Verified via screenshot,
  both locally and against production.
- **Remaining work:** None for this discrepancy. (Optional, unrelated
  polish: the venue backdrop currently only appears on the Career hub,
  not carried into the in-match view — not part of the original
  changelog claim, so not treated as required.)

## Item system (22 items, as of v1.19 — was 23 before Overdose's removal)

- **Status:** Verified complete for all 22 current items (re-counted
  directly from `ITEM_POOL_WEIGHTS` in `src/lib/game/items.ts` during the
  2026-08-07 checkpoint — Overdose was removed in v1.19, `6faf820`,
  "remove Overdose, cap Patch Kit to prevent stacked healing"). Every
  remaining `ItemId` has a matching `applyItemEffect` case, `ITEM_INFO`
  entry, icon (`src/components/game/itemIcons.tsx`), and category (`src/lib/game/colors.ts`).
  **Note for future sessions:** this "23 items" figure was hardcoded in
  prose across multiple memory files and went stale the moment Overdose
  was removed — prefer phrasing that doesn't require updating a count by
  hand (e.g. "the full item pool"), or re-derive the count from
  `ALL_ITEM_IDS.length` rather than typing a number, since the
  `/tutorial` glossary itself already does this correctly and never went
  stale.
- **Frontend:** `src/components/game/ItemCard.tsx` (rendering + tooltip), hand rendering in
  `src/components/game/PlayingView.tsx`.
- **Backend:** `src/lib/game/state.ts`'s `applyItemEffect()` switch, `playItem()`
  (removes from hand, calls the effect, is turn/phase-gated).
- **Validation:** Per-item `requireTarget()` helper rejects self-targeting,
  eliminated targets, and (team modes) teammates. `canHoldAnother()`
  caps Irons/Vulture's Due at one held per player, Scapegoat at one
  drawn per match, and (as of v1.19) Patch Kit at one held per player too
  (prevents stacking a burst multi-heal in one turn — this is what
  Overdose's removal was paired with).
- **Edge cases handled:** Adrenal Shot stealing Second Wind is
  special-cased (added directly to the thief's hand rather than
  recursively "used"); Adrenal Shot stealing an item with no valid
  target available still resolves gracefully (falls through
  `applyItemEffect`'s own target check for the *stolen* item).
- **Remaining work:** None identified.

## Item-pool customization (per-match enabled items)

- **Status:** Verified complete.
- **Frontend:** `src/components/game/GameSettingsForm.tsx`'s item-pool grid (toggle each of
  the 22 items (see "Item system" above re: this count), counted directly
  from `src/lib/game/types.ts`'s `ItemId` union and `src/lib/game/items.ts`'s `ITEM_POOL_WEIGHTS` —
  both agree; "All"/"None" shortcuts).
- **Backend:** `clampSettings()` filters `enabledItems` to valid IDs,
  falls back to the full pool if the resulting list would be empty.
  `weightedRandomItem(allowed?)` in `src/lib/game/items.ts` restricts draws to the
  allowed subset.
- **Validation:** UI prevents disabling the last remaining item (clicking
  "None" leaves exactly one item enabled, not zero) — see
  `src/components/game/GameSettingsForm.tsx`'s `"None"` button logic
  (`set("enabledItems", [ALL_ITEM_IDS[0]])`).
- **Remaining work:** None identified.

## Settings system (player count, rounds, HP range, items/reload, team mode)

- **Status:** Verified complete.
- **Backend:** `clampSettings()` is the single source of truth; every
  field is clamped/defaulted server-side regardless of what the client
  sends, so a malformed or malicious `settings` payload cannot desync the
  room from valid bounds.
- **Frontend:** `src/components/game/GameSettingsForm.tsx` mirrors the same invariants
  client-side for UX (e.g. forcing `playerCount=4` when picking "2v2
  Duos") purely so the UI doesn't show a contradictory state while
  waiting on a round-trip — the server clamp is still the real gate.
- **Remaining work:** None for the pre-existing settings. Team Mode is
  new and covered separately below.

## Table-vibe theme picker (5 presets)

- **Status:** Verified complete.
- **Frontend:** `src/components/game/ThemePicker.tsx`, `src/lib/themePresets.ts`,
  `src/app/layout.tsx`'s flash-avoidance `beforeInteractive` script,
  `src/app/globals.css`'s `:root[data-theme="..."]` blocks.
- **Persistence:** `localStorage["chamber-seven:theme"]` only — purely
  cosmetic, no server involvement.
- **Edge cases:** Missing/invalid stored theme falls back to
  `DEFAULT_THEME_ID` ("crimson").
- **Remaining work:** None identified. Note: this is a *palette* picker,
  not a light/dark mode toggle — see `UI_SYSTEM.md`.

## Global leaderboard

- **Status:** Mostly complete — functionally works end-to-end, but has a
  real trust/security gap (see `SECURITY.md`) that should be understood
  before treating win counts as meaningful.
- **User flow:** Any human win in any room → recorded automatically →
  visible on `/leaderboard` to anyone.
- **Frontend:** `src/app/leaderboard/page.tsx` (client-fetches on mount),
  a link from the landing page footer and from every in-game header.
- **Backend:** `party/game.ts`'s `saveState()` (calls
  `LEADERBOARD.recordWin(winner.name)` on `match_end`, guarded by
  `winnerRecorded` to avoid double-counting; wrapped in try/catch so a
  leaderboard failure never blocks the actual match's state save), the
  default `fetch` handler's `GET /leaderboard` route, `party/leaderboard.ts`.
- **Validation:** AI wins explicitly excluded (`if (!winner.isBot)`
  check before recording). Name length capped at 20 chars, entries capped
  at 500 total (least-wins entry evicted when exceeded).
- **Error states:** `src/app/leaderboard/page.tsx` shows "Couldn't load the
  leaderboard right now" on fetch failure; empty state ("No wins recorded
  yet...") when the list is empty.
- **Known gap (see `SECURITY.md`):** entries are keyed by
  lowercased/trimmed **display name only**, with zero ownership
  verification — anyone who types an existing leader's exact name will
  have their wins added to that same leaderboard entry. This is provable
  from `party/leaderboard.ts`'s `recordWin()`: the storage key is
  `name.trim().toLowerCase()`, with no token, seat, or session tied to it.
- **Remaining work:** If leaderboard integrity ever matters, would need
  some persistent identity beyond a typed name — currently out of scope
  (no auth system exists to build on).

## Changelog / patch notes page

- **Status:** Verified complete. Up to `v1.9` as of 2026-08-06; every
  changelog claim currently matches the shipped implementation (the
  Career Mode venue-backdrop discrepancy noted in earlier versions of
  this file has been resolved — see Career Mode above).
- **Frontend/data:** `src/lib/changelog.ts` (data), `src/app/changelog/page.tsx`
  (render). Purely static — no server involvement.
- **Remaining work:** None. Add a new entry whenever a new version ships
  — this is a standing process, not a one-off task.

## Tutorial and Lessons pages (v1.9, shipped)

- **Status:** Verified complete. Shipped and confirmed live in
  production 2026-08-06, via screenshot (both local and production).
- **Purpose:** `/tutorial` — the full rules, every game mode explained,
  and a complete glossary of the full item pool (22 as of v1.19; the page
  auto-generates from `ALL_ITEM_IDS` so this number is never hand-typed
  here and can't go stale) grouped by category
  (offense/defense/info/utility). `/lessons` — strategy tips tied
  directly to the actual mechanics (reading chamber odds, when to shoot
  yourself, item sequencing, mode-specific plays).
- **Frontend:** `src/app/tutorial/page.tsx`, `src/app/lessons/page.tsx`
  — both plain Server Components, no client state, no server
  round-trip. The item glossary is generated from `ALL_ITEM_IDS` +
  `ITEM_INFO` + `ITEM_ICONS` + `ITEM_CATEGORY`/`CATEGORY_COLOR` (the
  same single source of truth used by `src/components/game/ItemCard.tsx` and
  `src/components/game/GameSettingsForm.tsx`) rather than duplicating item text — a new
  item added to `src/lib/game/items.ts` automatically appears here with no further
  edit needed.
- **Navigation:** Linked from the landing page footer
  (`src/app/page.tsx`) and the in-game header (`src/components/game/GameRoom.tsx`'s
  `ConnectedRoom`), next to the existing Leaderboard/Patch notes links.
- **Backend:** None — fully static content.
- **Database dependency:** None.
- **Validation / error / loading / empty states:** Not applicable —
  static informational pages with no user input or async data.
- **Tests:** None automated (no test suite exists in this repo). Verified
  via screenshot at the time of shipping (v1.9, when the pool was still
  23 items): all items rendered across all 4 categories with correct
  colors/icons/descriptions; both pages confirmed live in production.
  Not independently re-screenshotted after v1.19's Overdose removal
  during this checkpoint, but since the page derives its list from
  `ALL_ITEM_IDS` at render time (not a hand-maintained list), there is no
  code path by which it could still be showing Overdose — confirmed by
  reading `src/app/tutorial/page.tsx`'s source, not just inference.
- **Known issues:** None.
- **Remaining work:** None. (Optional, unrelated: neither page is
  cross-linked from `/career`, `/leaderboard`, or `/changelog`'s own
  headers, consistent with those pages' existing minimal-header
  convention — see `UI_SYSTEM.md`.)

## Room / lobby / reconnect

- **Status:** Verified complete.
- **Frontend:** `src/components/game/Lobby.tsx` — room code display + copy-invite-link (for
  non-vsAI rooms), player list with connected/waiting indicators,
  "Start the Game" gated on `allConnected`.
- **Backend:** `claimSeat()` (join-or-reconnect-by-token),
  `markDisconnected()`, `onClose`/`onAlarm` in `party/game.ts`
  (`RECONNECT_GRACE_MS` = 2 minutes grace before forfeiture).
- **Edge cases:** Reconnecting mid-round via a valid token re-attaches to
  the same seat without losing game state; failing to reconnect within
  the grace period forfeits the seat (`forfeitSeat()`), which can end the
  round/match if it leaves only one team/seat alive.
- **RESOLVED (2026-08-06):** `src/components/game/Lobby.tsx` now previews team assignments
  (and the boss crown) before the match starts, whenever
  `teamMode !== "none"` — via a new pure `teamForSeatIndex()` helper in
  `src/lib/game/state.ts`, shared with the real `assignTeams()` so the preview can't
  drift from the actual rule. Verified via screenshot for both Duos and
  Boss Battle, both locally and against production.
- **Remaining work:** None.

## 2v2 Duos / Boss Battle team modes (v1.8, shipped)

- **Status:** **Verified complete.** Shipped and confirmed live in
  production 2026-08-06. A screenshot-based check (which sidesteps the
  DOM-text-query timing issues that produced earlier ambiguous
  Playwright evidence) confirmed correct behavior in both modes,
  including a check run **directly against the production URL**. See
  `PROJECT_STATE.md`'s "TASK-002 resolution" and "Status as of
  2026-08-06 (latest): SHIPPED" sections for the full evidence.
  **One residual gap:** the exact `src/components/game/MatchEndView.tsx` win/loss framing
  screen was not itself captured by screenshot (scripted matches didn't
  reach completion within a reasonable turn budget) — this code was
  manually reviewed line-by-line and is simple team-membership
  comparison logic, judged low-risk, but if you want to fully close
  this out, play one match to completion by hand and confirm the
  end-screen text.
- **Purpose:** 2v2 Duos (seats 1+3 vs 2+4, no friendly fire, single
  round) and Boss Battle (everyone vs. the last seat, who gets HP scaling
  and bonus item draws, single round).
- **Frontend:** `src/components/game/GameSettingsForm.tsx` (Team Mode selector — confirmed
  working), `src/components/game/PlayerHud.tsx` (team badge + boss crown — **confirmed
  rendering correctly via screenshot, both locally and in production**),
  `src/components/game/TargetSelector.tsx` (excludes teammates — **confirmed via screenshot**,
  the target picker correctly omits teammates in both modes),
  `src/components/game/MatchEndView.tsx` (team-aware win/loss framing + standings — code
  reviewed and judged correct, not itself screenshot-confirmed; see the
  residual gap noted above).
- **Backend:** `assignTeams()`, `bossSeatOf()`, `isTeammate()`,
  team-aware `roundOver()`, boss HP/item scaling in `beginRound()`/
  `reload()`, friendly-fire blocks in `fire()`/`applyItemEffect()`,
  Molotov excluding teammates, bot AI excluding teammates from targeting
  — all in `src/lib/game/state.ts`, all code-reviewed line-by-line this session, no
  logic error found.
- **Database dependency:** Same `RoomState`/Durable Object storage as
  everything else — `team`/`isBoss` fields added to
  `PlayerState`/`RedactedPlayer`.
- **Validation:** `clampSettings()` forces `teamMode="none"` if `"duos"`
  is requested without exactly 4 players, and forces `roundsToWin=1`
  whenever any team mode is active — code-reviewed, correct.
- **Error states:** `fire()`/`applyItemEffect()`'s `requireTarget()`
  return `"Can't fire at your own teammate."` / `"Can't target your own
  teammate."` — code-reviewed, correct.
- **Edge cases considered in code:** Boss HP multiplier scales with
  `max(1, otherPlayerCount)` so it's never below 1×; boss draws
  `itemsPerReload + 2` every reload; Molotov's "hit everyone" AOE
  explicitly excludes teammates in team modes (message text branches on
  `teamMode === "none" ? "everyone" : "every enemy"`).
- **Tests:** None automated (no test suite exists in this repo — see
  `TESTING.md`). Ad hoc, uncommitted Playwright/screenshot scripts were
  used to verify this feature before shipping; see `PROJECT_STATE.md`
  for the full trail, including the earlier ambiguous evidence and how
  it was resolved.
- **Known issues:** None blocking. See the residual match-end-screen
  gap noted above under Status.
- **Remaining work:** Optional only — update `src/components/game/Lobby.tsx` to preview
  team assignments before the match starts (`TASKS.md` `TASK-007`), and
  optionally do a manual full-match playthrough to directly confirm the
  match-end screen (see Status above).

## Site metadata / SEO (OpenGraph, robots.txt, sitemap) — shipped, live in production

- **Status:** Verified complete and **confirmed live in production**
  [Verified, 2026-08-17]. Commit `5816555` ("feat(metadata): add
  OpenGraph image, robots, and sitemap", 2026-08-13), merged into `main`
  via `96a03e5`. `curl https://chamber-seven-omega.vercel.app/robots.txt`
  returns the expected `Allow: /` / `Disallow: /room/` / `Sitemap:` body
  this session; `curl .../sitemap.xml` returns `200`.
- **Purpose:** OpenGraph/Twitter card metadata for link previews, a
  generated OG image, and `robots.txt`/`sitemap.xml` for search
  crawlers (deliberately disallowing `/room/` — live game rooms
  shouldn't be indexed).
- **Frontend:** `src/app/layout.tsx` (metadata fields),
  `src/app/opengraph-image.tsx` (Next.js file-convention dynamic OG
  image via `next/og`), `src/app/robots.ts`, `src/app/sitemap.ts`.
- **Backend:** None — static/build-time metadata only.
- **Tests:** None automated; verified this session via direct `curl`
  against the production URLs (see Status above), not via a browser
  link-preview check.

## Match-outcome neon/glitch headline effects (2026-08-15, merged into `main` 2026-08-17)

- **Status:** Merged into `main` (commit `5be92bc`, "Merge branch
  'chore/polish' into main") and deployed — [Verified, 2026-08-17] the
  merge is pushed to `origin/main` (`git rev-list --left-right --count
  origin/main...main` → 0/0) and a fresh Vercel Production deployment
  was observed via `vercel ls` shortly after. **Merge/deploy performed
  by a different, concurrent Claude Code session sharing this checkout,
  not by the session that wrote this entry** — see `PROJECT_STATE.md`'s
  2026-08-17 "continued" section. The effect's actual on-screen
  rendering has **not** been independently re-confirmed by a real
  browser check (`[Inferred]` live, not directly observed).
- **Purpose:** A win gets a pulsing neon-glow headline; a loss gets a
  glitch-flicker headline, on the match-end result text.
- **Frontend:** `src/components/game/MatchEndView.tsx:58` applies
  `match-outcome--win` or `match-outcome--lose` conditionally on the
  outcome headline; the animations themselves (`fx-neon`,
  `fx-glitch-a`/`fx-glitch-b` keyframes) are defined in
  `src/app/globals.css` (~line 638 onward).
- **Backend:** None — purely presentational, no server/state changes.
- **Accessibility:** Deliberately designed to cooperate with the existing
  `prefers-reduced-motion` rule (see `UI_SYSTEM.md` → Accessibility)
  without needing a per-effect override — both keyframes already resolve
  to an acceptable static end-state at 100%.
- **Tests:** None automated; not runtime-verified in a browser this
  session (code-reviewed only, both the diff and the merged CSS/TSX).
- **Remaining work:** A real-browser confirmation that this renders
  correctly on the live match-end screen (win and loss cases both), and
  a `src/lib/changelog.ts` entry — see `TASKS.md` `TASK-010`.
