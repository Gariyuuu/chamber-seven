# TASKS.md — Active Execution Queue

Update this file after every meaningful session. Move completed tasks to
"Recently completed" rather than deleting them (keeps history without
bloating `SESSION_LOG.md`).

## Current task

**None.** The entire backlog as of the 2026-08-06 documentation audit
(`TASK-001` through `TASK-008`) is complete, committed, deployed, and
verified live in production. See "Recently completed" below for the
full record. Nothing is queued — wait for the user's next direction
rather than inventing new work.

## v1.8 ship — full record

### TASK-001 — Finish and ship the 2v2 Duos / Boss Battle team modes (v1.8)
- **Status:** **DONE (2026-08-06).** Committed as two commits
  (`47c651e` — documentation system; `2a9c951` — the team-mode feature
  itself), deployed to both targets, and verified live in production.
  - `npx wrangler deploy` — succeeded. Worker deployed at
    `https://chamber-seven.chamber-seven.workers.dev` (this confirms the
    previously-unverified subdomain — see `DEPLOYMENT.md`, now updated).
  - `npx vercel deploy --prod` — succeeded, aliased to
    `https://chamber-seven-omega.vercel.app`.
  - Production verification: `curl`'d `/changelog` and confirmed the
    v1.8 entry text ("2v2 Duos", "Boss Battle") is live. Ran a
    screenshot-based check of a real Boss Battle match against the
    **live production URL** (not localhost) — confirmed the boss crown,
    correct 3× HP scaling (15/15 vs 5/5), correct bonus item count (5 vs
    3), correct team badges, and correct teammate-exclusion in the
    target picker, all on the actual deployed Worker + frontend.
- **Priority:** High (was)
- **Exact objective:** Get the already-written 2v2 Duos / Boss Battle
  team-mode feature from "code-complete, uncommitted, unverified" to
  "committed, deployed, confirmed working in production."
- **What has already been completed:**
  - Data model: `TeamMode = "none" | "duos" | "boss"` on `GameSettings`,
    `team`/`isBoss` fields on `PlayerState`/`RedactedPlayer`
    (`src/lib/game/types.ts`).
  - Engine: `assignTeams()`, `bossSeatOf()`, `isTeammate()`, a
    team-aware `roundOver()`, boss HP scaling + bonus item draws,
    friendly-fire blocks in `fire()`/`applyItemEffect()`, Molotov
    excluding teammates, `clampSettings()` invariants (duos requires 4
    players; any team mode forces `roundsToWin=1`) — all in
    `src/lib/game/state.ts`.
  - Bot AI: `runBotStep()` excludes teammates from targeting.
  - Settings UI: Team Mode selector in `GameSettingsForm.tsx`.
  - Client UI: team badge + boss crown in `PlayerHud.tsx`, teammate
    exclusion in `TargetSelector.tsx`, team-aware win/loss framing and
    standings in `MatchEndView.tsx`.
  - `career.ts` fixed to supply `teamMode: "none"` in
    `careerMatchSettings()`.
  - A `v1.8` changelog entry drafted in `src/lib/changelog.ts`.
  - All of the above passes `npm run typecheck`,
    `npm run typecheck:party`, `npm run lint`, and `npm run build`
    cleanly (re-confirmed as of the most recent checkpoint).
- **What remains:** Nothing — all steps below are complete.
- **Relevant files:** `src/lib/game/types.ts`, `src/lib/game/state.ts`,
  `src/components/game/GameSettingsForm.tsx`,
  `src/components/game/PlayerHud.tsx`,
  `src/components/game/TargetSelector.tsx`,
  `src/components/game/MatchEndView.tsx`, `src/lib/career.ts`,
  `src/lib/changelog.ts` (all currently modified, uncommitted — see
  `PROJECT_STATE.md` for the exact `git status`/`git diff --stat`).
- **Known errors:** None from static analysis (typecheck/lint/build are
  all clean). The one known problem is a **behavioral uncertainty, not a
  compile/lint error** — see TASK-002. No stack traces, exceptions, or
  build failures have been observed connected to this feature at any
  point.
- **Blockers:** None (resolved).
- **Dependencies:** TASK-002 (resolved).
- **Acceptance criteria (all met):**
  1. ✅ `npm run typecheck && npm run typecheck:party && npm run lint &&
     npm run build` all pass.
  2. ✅ 2v2 Duos confirmed via screenshot: correct team split (p1+p3 vs
     p2+p4), team badges visible on every player, teammate correctly
     excluded from the target picker. (Full match-end framing was not
     captured by screenshot — see TASK-002's resolution note for why
     this residual gap was judged low-risk and non-blocking.)
  3. ✅ Boss Battle confirmed via screenshot, including **against live
     production**: boss crown, exactly 3× HP, exactly +2 bonus items,
     correct team split, teammate-excluded targeting.
  4. ✅ Committed (`47c651e`, `2a9c951`).
  5. ✅ `npx wrangler deploy` succeeded.
  6. ✅ `vercel deploy --prod` succeeded.
  7. ✅ Re-verified against the production URLs (changelog text + a full
     production screenshot of a live Boss Battle match).
- **Notes:** Both deploys and the production check all happened in the
  same follow-up session that resolved TASK-002 — see `SESSION_LOG.md`'s
  latest entry for the full chronological record.

### TASK-002 — Root-cause the team-badge rendering contradiction
- **Status:** **RESOLVED (2026-08-06).** Screenshot-based verification
  confirmed the feature works correctly in both modes — team badges,
  boss crown, HP scaling (30/30 vs 10/10, exactly 3×), bonus item draws
  (5 vs 3, exactly +2), and teammate-exclusion in the target picker all
  render correctly and persist correctly deep into actual play. The
  earlier contradictory evidence was traced to two benign false leads
  (a legitimate second "single round" text match, and Playwright
  text-query timing artifacts in the original ad hoc test script) — see
  `PROJECT_STATE.md`'s "TASK-002 resolution" section for full detail.
  Proceeding to `TASK-001`.
- **Priority:** High (blocks TASK-001)
- **Exact objective:** Get a single, trustworthy, reproducible answer to
  "does the 2v2 Duos / Boss Battle UI (team badges, boss crown,
  teammate-targeting exclusion, match-end framing) actually work
  correctly for a real player in a real browser?" — replacing the
  current contradictory evidence with a confident yes or no.
- **What has already been completed:**
  - Every relevant server-side function (`assignTeams()`, `bossSeatOf()`,
    `isTeammate()`, `roundOver()`, `redact()`) was manually re-read
    line-by-line and appears logically correct — no bug was found by
    code review alone.
  - One direct DOM inspection (dumping the actual rendered
    `felt-panel` HTML mid-match, via an ad hoc Playwright script) showed
    team badges rendering correctly ("Team B" on one bot, "Team A" on
    another).
  - Multiple *other* full end-to-end script runs, checking rendered page
    text for "Team A"/"Team B" shortly after the game entered the
    "playing" phase, reported **both badges absent** — including after
    adding explicit settle-delays.
  - Several environmental confounders were identified and worked around
    during testing (a background dev-server process getting killed
    unexpectedly mid-test; a port collision with an unrelated project
    also running `next dev` on port 3000) — neither was proven to be the
    actual cause of the badge contradiction, but both are documented so
    they aren't mistaken for it.
  - One unexplained clue worth checking first: a diagnostic found 2
    matches for the Team-Mode hint paragraph text while only 1 dialog
    was reportedly open — possibly evidence that `GameSettingsForm`
    renders more than once in the DOM simultaneously (e.g. both the
    "Host a Table" and "Play vs AI" dialogs mounting their own instance
    even when only one is visually open). See `PROJECT_STATE.md` for
    the full note — this could explain how a click sequence ends up
    acting on a different settings object than what's visually selected.
- **What remains:** A clean, manual (non-scripted) confirmation — see
  validation steps below.
- **Relevant files:** `src/components/game/PlayerHud.tsx`,
  `src/lib/game/state.ts` (`redact()`, `assignTeams()`)
- **Known errors:** No compiler/lint/build error is involved. The
  "error," if it is one, is purely a runtime UI-rendering discrepancy
  observed only via ad hoc, uncommitted test scripts — nothing
  reproducible has been captured in a form that survives this session
  (no screenshot, no saved DOM dump beyond what's quoted in
  `PROJECT_STATE.md`).
- **Blockers:** None — this is the very next thing to do.
- **Dependencies:** None.
- **Acceptance criteria:** A definitive, reproducible answer to "do
  Team A/Team B badges and the boss crown actually render correctly for
  a real player," backed by either (a) a clean manual browser check, or
  (b) an isolated, reliable automated repro if the bug is real.
- **Verification steps:**
  1. Run `npm run dev:all` (verify which port `next dev` actually bound
     to in its own startup log — do not assume 3000, see
     `PROJECT_STATE.md`'s port-collision note).
  2. In a normal, human-driven browser (not a script), start a "Play vs
     AI" match with 4 players and Team Mode = "2v2 Duos". Visually
     confirm team badges appear on all 4 players once the match starts.
  3. Repeat for "Boss Battle" and visually confirm the crown + HP scaling.
  4. If both look correct by eye, the earlier scripted-test contradiction
     was very likely a Playwright/browser-automation timing artifact
     specific to the ad hoc test script (not committed to this repo) —
     document that conclusion in `PROJECT_STATE.md` and proceed to
     TASK-001's remaining steps.
  5. If either looks wrong by eye, that's a real bug — debug from there
     (start by re-reading `assignTeams()` and `redact()` in `state.ts`,
     both of which were manually reviewed and looked correct this
     session, so the bug, if real, may be in a component's conditional
     rendering rather than the engine).
- **Notes:** See `PROJECT_STATE.md` for the full history of what was
  tried and observed this session, so this isn't re-investigated from
  zero.

### TASK-003 — Add a `v1.8` changelog entry publicly
- **Status:** **DONE (2026-08-06).** Live at
  `https://chamber-seven-omega.vercel.app/changelog`, confirmed via curl
  after deploy.
- **Priority:** Medium (was)
- **Relevant files:** `src/lib/changelog.ts`

## Next up

Nothing is currently queued. `TASK-004` through `TASK-008` (the entire
prior backlog) were completed, committed, deployed, and verified live
in production on 2026-08-06, in the same session that shipped v1.8 —
see "Recently completed" below.

## Blocked

Nothing currently blocked.

## High priority

Nothing outstanding.

## Medium priority

Nothing outstanding.

## Low priority

Nothing outstanding.

## Closed backlog (2026-08-06) — see "Recently completed" for the full record

### TASK-004 — Decide the fate of the unused venue/tier images
- **Status:** **DONE.** Went with option (a): wired `bot.tier` (via
  `nextOpponent(career)?.tier ?? 6`) into a layered venue backdrop
  behind the Career hub's hero banner (`src/app/career/page.tsx`), and
  gave `victory-burst.png` a job as a soft glow behind the level-up
  panel on `MatchEndView.tsx`. Verified via screenshot, both locally and
  against production.
- **Commit:** `51afb5e`.

### TASK-005 — Fix the inconsistent local-dev WebSocket host fallback
- **Status:** **DONE.** `useGameRoom.ts`'s fallback now matches
  `leaderboardApi.ts`'s (`127.0.0.1:8787`).
- **Commit:** `6d55991`.

### TASK-006 — Remove or use the `zustand` dependency
- **Status:** **DONE.** Re-confirmed unused via a fresh grep, then
  removed from `package.json` + regenerated `package-lock.json` via
  `npm install`.
- **Commit:** `71c3956`.

### TASK-007 — Show team assignments in the pre-game lobby
- **Status:** **DONE.** Extracted a pure `teamForSeatIndex(teamMode,
  index, seatCount)` helper in `state.ts` (also used by the real
  `assignTeams()`, eliminating any risk of the preview drifting from
  the real rule), and used it in `Lobby.tsx` to show the same team
  badge / boss crown treatment as the in-game HUD, before the round
  starts. Verified via screenshot for both Duos and Boss Battle, both
  locally and against production.
- **Commit:** `83c6c3f`.

### TASK-008 — Update the stale root `README.md`
- **Status:** **DONE.** Now describes the 2–4 player FFA, vs-AI, Career
  Mode, team modes, leaderboard, and theme picker; documents the
  `npx wrangler types` first-time-setup step; points to the in-repo
  documentation system for depth.
- **Commit:** `ea9728b`.

## Bugs

None outstanding. TASK-002/004/005 (the only items ever tracked here)
are all resolved — see "Closed backlog" above and "Recently completed"
below.

## Technical debt

- ~~`zustand` unused dependency~~ — **removed**, TASK-006 (`71c3956`).
- No shared `<Nav>`/header component — every page repeats its own header
  JSX (`src/app/**/page.tsx`). Not urgent, but a future page addition
  would benefit from extracting this.
- `src/lib/game/state.ts` is ~940 lines in one file. Intentionally kept
  together (shared verbatim between two runtimes, single source of
  truth) — see `DECISIONS.md` — but if it keeps growing, consider
  splitting by concern (e.g. `state/items.ts` for `applyItemEffect`,
  `state/bots.ts` for the AI) while keeping a single barrel export, so
  both `tsconfig.json` projects still see one clean import surface.
- `npm audit` (run 2026-08-06 while regenerating the lockfile for
  TASK-006) reports 3 vulnerabilities (2 moderate, 1 high) in `undici`,
  transitively via `wrangler`'s bundled `miniflare` (local Worker dev
  simulation only — not part of the deployed Worker runtime bundle, and
  not reachable from application code). `npm audit fix --force` would
  downgrade `wrangler` from `4.118.0` to `4.35.0`, a large breaking
  change to core deploy tooling — **not applied**, needs a deliberate
  decision (e.g. wait for an in-range `wrangler` patch that bumps its
  own `undici`, rather than force-downgrading). Not blocking anything
  today. See `SECURITY.md`.

## Testing needed

- No automated tests exist at all — see `TESTING.md`. The single highest-
  value first test to add (if/when a testing framework is introduced)
  would cover the `redact()` boundary (asserting a `RedactedState` for
  seat A never contains seat B's real `items` array or the real
  `chamber` order) — since that's the one invariant a silent regression
  would be both severe and easy to miss by eye.

## Documentation needed

- None outstanding beyond what this audit just produced — keep it
  updated going forward per `CLAUDE.md`'s permanent rules.

## Recently completed (terse history — see the detailed section above
for the full v1.8 record)

- Post-v1.8 backlog cleanup — Career Mode venue backdrops + victory
  burst wired up, local-dev host fallback fixed, `zustand` removed,
  lobby team/boss preview added, `README.md` updated. Committed as 5
  separate commits (`51afb5e`, `6d55991`, `71c3956`, `83c6c3f`,
  `ea9728b`), deployed to production 2026-08-06, verified live.
- v1.8 — 2v2 Duos and Boss Battle team modes. Committed (`47c651e`,
  `2a9c951`) and deployed to production 2026-08-06; verified live. Also
  shipped the full in-repo documentation/handoff memory system in the
  same session.
- v1.7 — Career Mode (12-bot ladder + 20 illustrated images). Committed
  (`3a26ab9`) and deployed to production.
- v1.6 — Real background art, animated dealer avatar, bolder item colors.
  Committed and deployed.
- v1.5 — Neon Tokyo theme + healing items + custom item pools +
  leaderboard. Committed and deployed.
- v1.4 — Colorful redesign + patch notes page. Committed and deployed.
- v1.3 — Balance pass (Irons/Vulture's Due caps, rarer Irons, Magnum
  Load added). Committed and deployed.
- v1.2 — Decorative visual pass (felt table, poker-chip code,
  flourishes). Committed and deployed.
- v1.1 — N-player FFA expansion (2–4 players, settings menu, 10 new
  items). Committed and deployed.
- v1.0 — Initial launch (2-player duel, 10 items, vs-AI). Committed and
  deployed.

(All of the above confirmed via `git log --oneline` and
`src/lib/changelog.ts` agreeing with each other.)

## Deferred

None recorded — no explicit deferrals were found in code comments or
commit history.

## Rejected ideas

None recorded — no explicit rejections were found in code comments or
commit history. (This section is here per the standard template; nothing
to report as of this audit.)
