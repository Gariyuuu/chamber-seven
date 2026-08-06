# TASKS.md — Active Execution Queue

Update this file after every meaningful session. Move completed tasks to
"Recently completed" rather than deleting them (keeps history without
bloating `SESSION_LOG.md`).

## Current task

### TASK-001 — Finish and ship the 2v2 Duos / Boss Battle team modes (v1.8)
- **Status:** In progress, blocked on verification (see TASK-002)
- **Priority:** High
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
- **What remains:**
  1. Resolve TASK-002 (root-cause or rule out the team-badge rendering
     contradiction) — **do this first, nothing else in this task should
     proceed until it's resolved.**
  2. Commit the changes with a descriptive message.
  3. `npx wrangler deploy` (Worker).
  4. `vercel deploy --prod` (frontend).
  5. Re-verify the golden path against the **production** URLs, not
     just localhost.
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
- **Blockers:** TASK-002 must resolve first.
- **Dependencies:** TASK-002.
- **Acceptance criteria:**
  1. `npm run typecheck && npm run typecheck:party && npm run lint &&
     npm run build` all pass (already true).
  2. A real-browser (not just scripted) playthrough of a 4-player 2v2
     Duos match confirms: correct team split (p1+p3 vs p2+p4), team
     badges visible on every player, cannot target a teammate, round
     ends when one team is fully eliminated, match-end screen frames the
     result correctly.
  3. A real-browser playthrough of a Boss Battle match confirms: the
     last seat is visibly the boss (crown icon), has noticeably more HP,
     draws more items per reload, everyone else is teamed against them,
     match-end screen says "Boss wins" or names the winning
     challengers appropriately.
  4. Changes committed with a descriptive message.
  5. `npx wrangler deploy` run successfully.
  6. `vercel deploy --prod` run successfully.
  7. Both of the above re-verified against the **production** URLs (not
     just localhost).
- **Verification steps:** Run the four static-check commands in
  criterion 1, then walk criteria 2–3 by hand in a real browser (see
  TASK-002's validation steps for exactly how), then criteria 4–7 in
  order.
- **Notes:** Do not skip step 7 — this session confirmed local dev
  servers can behave unexpectedly (see `PROJECT_STATE.md` "Errors
  observed"), so a clean local pass is not sufficient confidence to skip
  a production check.

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

## Next up

### TASK-003 — Add a `v1.8` changelog entry publicly
- **Status:** Draft already written, not yet "real" (undeployed)
- **Priority:** Medium (bundled with TASK-001, not independent)
- **Relevant files:** `src/lib/changelog.ts`
- **Dependencies:** TASK-001
- **Acceptance criteria:** The already-drafted `v1.8` entry ships as part
  of the same deploy as the feature it describes.
- **Notes:** No action needed beyond what TASK-001 already covers — this
  entry exists to make sure it isn't forgotten/dropped independently.

## Blocked

(TASK-001 and TASK-002 are cross-listed above under Current — nothing
additional is blocked right now.)

## High priority

### TASK-004 — Decide the fate of the unused venue/tier images
- **Status:** Not started
- **Priority:** High-ish (it's a documentation-vs-reality mismatch, not a
  functional bug, but the changelog actively misrepresents what shipped)
- **Relevant files:** `public/venues/tier1.png`–`tier6.png`,
  `public/victory-burst.png`, `src/app/career/page.tsx`,
  `src/lib/game/bots.ts` (`BotProfile.tier`), `src/lib/changelog.ts`
  (the v1.7 entry's claim)
- **Acceptance criteria:** Either (a) wire `bot.tier` to swap the Career
  Mode hero background per current tier and find a use for
  `victory-burst.png` (e.g. the Career Mode `MatchEndView` reward panel
  on a win), or (b) edit the v1.7 changelog entry to stop claiming this
  shipped. Pick one — don't leave the contradiction standing.
- **Notes:** See `FEATURES.md` → Career Mode for the full write-up of
  this discrepancy.

## Medium priority

### TASK-005 — Fix the inconsistent local-dev WebSocket host fallback
- **Status:** Not started
- **Priority:** Medium (cosmetic/consistency, `.env.local` masks it in
  practice)
- **Relevant files:** `src/hooks/useGameRoom.ts` (fallback
  `"127.0.0.1:1999"`), `src/lib/leaderboardApi.ts` (fallback
  `"127.0.0.1:8787"`)
- **Acceptance criteria:** Both fallbacks agree (should both be
  `127.0.0.1:8787`, matching `wrangler dev --port 8787`).

### TASK-006 — Remove or use the `zustand` dependency
- **Status:** Not started
- **Priority:** Medium
- **Relevant files:** `package.json`
- **Acceptance criteria:** Confirm (fresh grep, don't trust this note
  blindly per `CLAUDE.md` rule 16) that `zustand` is genuinely unused,
  then either remove it from `package.json`/`package-lock.json` or start
  using it deliberately for a real need.

### TASK-007 — Show team assignments in the pre-game lobby
- **Status:** Not started
- **Priority:** Medium (nice-to-have UX, only relevant once TASK-001
  ships)
- **Relevant files:** `src/components/game/Lobby.tsx`
- **Acceptance criteria:** When `state.settings.teamMode !== "none"`, the
  lobby player list shows which team each seat will be on (and which
  seat will be the boss, for Boss Battle) before the match starts.
- **Dependencies:** TASK-001.

## Low priority

### TASK-008 — Update the stale root `README.md`
- **Status:** Not started
- **Priority:** Low (this memory system is now authoritative; README is
  the human-facing front door on GitHub, still worth fixing eventually)
- **Relevant files:** `README.md`
- **Acceptance criteria:** README reflects 2–4 player FFA, Career Mode,
  and (once shipped) team modes — not just the original 2-player
  description.

## Bugs

(See TASK-002, TASK-004, TASK-005 above — no additional confirmed bugs
found during this audit's code review.)

## Technical debt

- `zustand` unused dependency — TASK-006.
- No shared `<Nav>`/header component — every page repeats its own header
  JSX (`src/app/**/page.tsx`). Not urgent, but a future page addition
  would benefit from extracting this.
- `src/lib/game/state.ts` is 929 lines in one file. Intentionally kept
  together (shared verbatim between two runtimes, single source of
  truth) — see `DECISIONS.md` — but if it keeps growing, consider
  splitting by concern (e.g. `state/items.ts` for `applyItemEffect`,
  `state/bots.ts` for the AI) while keeping a single barrel export, so
  both `tsconfig.json` projects still see one clean import surface.

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

## Recently completed

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
