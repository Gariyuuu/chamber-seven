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
- **Frontend:** `PlayingView.tsx`, `ActionBar.tsx`, `ChamberBar.tsx`,
  `TargetSelector.tsx`, `PlayerHud.tsx`, `HealthBar.tsx`.
- **Backend:** `party/game.ts` (`fire` message handler) →
  `src/lib/game/state.ts` (`fire()`, `resolveHit()`, `applyDamage()`,
  `passTurnFrom()`, `reload()`, `maybeReload()`).
- **Database dependency:** Durable Object storage (`Main`, key `"room"`)
  — the entire `RoomState` including `chamber: ShellType[]`.
- **Validation:** Server-side only — phase must be `"playing"`, must be
  the acting seat's turn, chamber must be non-empty, target must be a
  valid non-eliminated active seat, and (team modes) not a teammate.
- **Error states:** Invalid actions return `{ok:false, error}`, shown as
  a 4-second banner (`GameRoom.tsx`).
- **Loading states:** `Loader2` spinner while `!connected || !state ||
  !seat` in `ConnectedRoom` (`GameRoom.tsx`).
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
- **Frontend:** `GameSettingsForm.tsx` (player-count selector),
  `PlayingView.tsx`'s "others" grid (`sm:grid-cols-2`).
- **Backend:** `activeSeats()`, `aliveActiveSeats()`, `nextAliveSeat()`,
  `roundOver()` in `state.ts`, all parameterized over
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
  true)`), `DealerAvatar.tsx` (bot avatar + firing animation),
  `PlayingView.tsx`'s `useDealerFx` (detects fresh "fires at" log lines
  from bot seats to trigger the animation cue).
- **Backend:** `party/game.ts`'s `join` handler
  (`fillRemainingSeatsWithBots` when `msg.vsAI && seat === hostSeat`),
  `state.ts`'s `fillBotSeat`/`fillRemainingSeatsWithBots`,
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
  starting from a 3-item kit and ending with the full 23-item pool.
- **User flow:** Landing page → "Career Mode" → hub page shows rank,
  HP range, items unlocked, and a 12-card bot grid (locked / current /
  defeated) → "Fight `<bot>`" → single-round vs-AI match at that bot's
  skill and the player's current HP/item unlocks → on win, `GameRoom`
  records the win to `localStorage` and shows a reward panel
  (level-up / new item, or "already beaten" if refought).
- **Frontend:** `src/app/career/page.tsx`, `src/components/game/BotCard.tsx`,
  `MatchEndView.tsx`'s career-reward panel.
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
- **Known issue — verified via repo-wide grep:** the v1.7 changelog entry
  claims "6 mood-lit venue backdrops that escalate from a dim back alley
  to a blood-red penthouse as you climb the ladder." **This is not
  actually implemented.** `public/venues/tier1.png`–`tier6.png` exist as
  files but are never referenced by `career/page.tsx` or any other source
  file (confirmed: zero matches for `venue`/`tier1`.. outside a code
  comment and the changelog string itself). The Career Mode page shows
  one single static `career-hero.png` regardless of the player's current
  tier. `public/victory-burst.png` is similarly unreferenced.
  **Classify the "escalating venue backdrop" feature specifically as:
  Planned / not implemented, despite the changelog claiming it shipped.**
- **Remaining work:** Either wire `bot.tier` → a matching
  `public/venues/tier<N>.png` background on the career hub (and/or the
  in-match background) and remove/repurpose `victory-burst.png`, or
  correct the changelog's claim to match reality.

## Item system (23 items)

- **Status:** Verified complete for all 23 items — every `ItemId` has a
  matching `applyItemEffect` case, `ITEM_INFO` entry, icon
  (`itemIcons.tsx`), and category (`colors.ts`). Traced every case
  individually against `ITEM_INFO`'s description to confirm behavior
  matches the described effect; no mismatches found.
- **Frontend:** `ItemCard.tsx` (rendering + tooltip), hand rendering in
  `PlayingView.tsx`.
- **Backend:** `state.ts`'s `applyItemEffect()` switch, `playItem()`
  (removes from hand, calls the effect, is turn/phase-gated).
- **Validation:** Per-item `requireTarget()` helper rejects self-targeting,
  eliminated targets, and (team modes) teammates. `canHoldAnother()`
  caps Irons/Vulture's Due at one held per player, Scapegoat at one
  drawn per match.
- **Edge cases handled:** Adrenal Shot stealing Second Wind is
  special-cased (added directly to the thief's hand rather than
  recursively "used"); Adrenal Shot stealing an item with no valid
  target available still resolves gracefully (falls through
  `applyItemEffect`'s own target check for the *stolen* item).
- **Remaining work:** None identified.

## Item-pool customization (per-match enabled items)

- **Status:** Verified complete.
- **Frontend:** `GameSettingsForm.tsx`'s item-pool grid (toggle each of
  the 23 items, counted directly from `types.ts`'s `ItemId` union and
  `items.ts`'s `ITEM_POOL_WEIGHTS` — both agree; "All"/"None" shortcuts).
- **Backend:** `clampSettings()` filters `enabledItems` to valid IDs,
  falls back to the full pool if the resulting list would be empty.
  `weightedRandomItem(allowed?)` in `items.ts` restricts draws to the
  allowed subset.
- **Validation:** UI prevents disabling the last remaining item (clicking
  "None" leaves exactly one item enabled, not zero) — see
  `GameSettingsForm.tsx`'s `"None"` button logic
  (`set("enabledItems", [ALL_ITEM_IDS[0]])`).
- **Remaining work:** None identified.

## Settings system (player count, rounds, HP range, items/reload, team mode)

- **Status:** Verified complete.
- **Backend:** `clampSettings()` is the single source of truth; every
  field is clamped/defaulted server-side regardless of what the client
  sends, so a malformed or malicious `settings` payload cannot desync the
  room from valid bounds.
- **Frontend:** `GameSettingsForm.tsx` mirrors the same invariants
  client-side for UX (e.g. forcing `playerCount=4` when picking "2v2
  Duos") purely so the UI doesn't show a contradictory state while
  waiting on a round-trip — the server clamp is still the real gate.
- **Remaining work:** None for the pre-existing settings. Team Mode is
  new and covered separately below.

## Table-vibe theme picker (5 presets)

- **Status:** Verified complete.
- **Frontend:** `ThemePicker.tsx`, `src/lib/themePresets.ts`,
  `layout.tsx`'s flash-avoidance `beforeInteractive` script,
  `globals.css`'s `:root[data-theme="..."]` blocks.
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
- **Error states:** `leaderboard/page.tsx` shows "Couldn't load the
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

- **Status:** Verified complete (as a *mechanism*) — but see the Career
  Mode entry above for one specific factual claim in its *content* that
  doesn't match the shipped implementation.
- **Frontend/data:** `src/lib/changelog.ts` (data), `src/app/changelog/page.tsx`
  (render). Purely static — no server involvement.
- **Remaining work:** Add a `v1.8` entry once the team-mode work
  (currently uncommitted) is confirmed working and deployed — a draft
  entry already exists in the working tree, see `PROJECT_STATE.md`.

## Room / lobby / reconnect

- **Status:** Verified complete.
- **Frontend:** `Lobby.tsx` — room code display + copy-invite-link (for
  non-vsAI rooms), player list with connected/waiting indicators,
  "Start the Game" gated on `allConnected`.
- **Backend:** `claimSeat()` (join-or-reconnect-by-token),
  `markDisconnected()`, `onClose`/`onAlarm` in `party/game.ts`
  (`RECONNECT_GRACE_MS` = 2 minutes grace before forfeiture).
- **Edge cases:** Reconnecting mid-round via a valid token re-attaches to
  the same seat without losing game state; failing to reconnect within
  the grace period forfeits the seat (`forfeitSeat()`), which can end the
  round/match if it leaves only one team/seat alive.
- **Known gap (UX, not a bug):** `Lobby.tsx` does not currently preview
  team assignments (which seats will be on which team) before the match
  starts, even when `teamMode !== "none"` — teams are only visible once
  `PlayingView` renders. Minor, cosmetic gap.
- **Remaining work:** Optional — show a team-mode preview in the lobby.

## 2v2 Duos / Boss Battle team modes (v1.8, in progress)

- **Status:** **Partially implemented / Unable to verify at runtime.**
  All code paths exist and pass static checks (typecheck × 2, lint,
  build), but end-to-end runtime behavior was **not conclusively
  confirmed** this session — see `PROJECT_STATE.md` for the full,
  contradictory test evidence. Do not classify this higher than
  "Partially implemented" until a fresh runtime check (ideally manual,
  in a real browser) confirms it.
- **Purpose:** 2v2 Duos (seats 1+3 vs 2+4, no friendly fire, single
  round) and Boss Battle (everyone vs. the last seat, who gets HP scaling
  and bonus item draws, single round).
- **Frontend:** `GameSettingsForm.tsx` (Team Mode selector — code
  reviewed, looks correct), `PlayerHud.tsx` (team badge + boss crown —
  code reviewed, looks correct; **directly observed rendering correctly
  once**, via a raw DOM dump, during this session), `TargetSelector.tsx`
  (excludes teammates — code reviewed, looks correct),
  `MatchEndView.tsx` (team-aware win/loss framing + standings — code
  reviewed, looks correct, not runtime-confirmed).
- **Backend:** `assignTeams()`, `bossSeatOf()`, `isTeammate()`,
  team-aware `roundOver()`, boss HP/item scaling in `beginRound()`/
  `reload()`, friendly-fire blocks in `fire()`/`applyItemEffect()`,
  Molotov excluding teammates, bot AI excluding teammates from targeting
  — all in `state.ts`, all code-reviewed line-by-line this session, no
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
- **Tests:** None automated. Ad hoc Playwright scripts were used this
  session (not committed to the repo) with contradictory results — see
  `PROJECT_STATE.md`.
- **Known issues:** The unresolved runtime-verification contradiction
  itself is the headline issue — see `PROJECT_STATE.md` and `TASKS.md`
  `TASK-002`.
- **Remaining work:** Root-cause/confirm runtime behavior, commit, deploy
  both targets, re-verify in production, add the `v1.8` changelog entry
  publicly (data already drafted in `changelog.ts`), update `Lobby.tsx`
  to preview team assignments if desired (optional, not blocking).
