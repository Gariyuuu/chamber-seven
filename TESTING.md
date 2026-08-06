# TESTING.md

## Current test strategy

**There is no automated test suite.** No test framework (Jest, Vitest,
Playwright, Cypress, etc.) is listed in `package.json`, no `npm test`
script exists, and no `*.test.*`/`*.spec.*` files exist anywhere in the
repository (verified via a repo-wide `find`). Verification currently
relies entirely on:

1. Static checks: `npm run typecheck`, `npm run typecheck:party`,
   `npm run lint`, `npm run build`.
2. Manual/ad hoc browser testing during development (not committed to
   the repo).
3. Occasional ad hoc Playwright scripts, written from scratch in a
   scratch/tmp directory outside version control, used to drive the real
   dev UI through a scenario. These are **throwaway** — nothing from
   them persists in this repo, and a future session must write its own
   if it wants this kind of coverage again.

This is a real gap, not a stylistic choice — see `CLAUDE.md` → Known
issues and `TASKS.md` → Testing needed.

## Test frameworks

None installed. If one is introduced in the future:
- **Unit/integration tests for `src/lib/game/state.ts`** would be the
  highest-value addition — it's pure, synchronous, dependency-light
  TypeScript (mutates a plain `RoomState` object, no I/O), which makes it
  very cheap to unit test without any mocking infrastructure. Vitest
  would be a natural fit given the Vite-adjacent tooling already in the
  Next.js/Turbopack ecosystem, but this is a recommendation, not an
  existing convention.
- **End-to-end tests** would need Playwright (or similar) driving both
  `next dev` and `wrangler dev` simultaneously — exactly the pattern
  used ad hoc this session (see below for the gotchas encountered).

## Test directory structure

None exists. If tests are added, no existing convention dictates where
they should live — a reasonable default would be co-located
`*.test.ts` files next to the modules they cover (e.g.
`src/lib/game/state.test.ts`), consistent with the rest of the
codebase's flat, colocated-by-concern organization.

## Existing tests

None.

## Missing test areas (highest-value first)

1. **`redact()`'s information boundary** — the single most
   security/correctness-critical function in the codebase (see
   `ARCHITECTURE.md` → Security boundaries). A test asserting that
   `redact(room, "p1")` never contains `room.players.p2.items`,
   `room.chamber`, or any other seat's true hand would catch a
   regression here immediately, and currently nothing does.
2. **`clampSettings()`'s invariants** — especially the newer, uncommitted
   team-mode invariants ("duos requires exactly 4 players," "any team
   mode forces `roundsToWin=1`") — easy to unit test exhaustively since
   it's a pure function.
3. **Turn-order/elimination logic** (`nextAliveSeat`, `passTurnFrom`,
   `roundOver`) across 2/3/4-player and team-mode configurations.
4. **Item effects** (`applyItemEffect`'s 23 cases) — currently only
   verified by code-reading during this audit, never by an executable
   test.
5. **The bot AI's `runBotStep`** — at minimum, a test that a bot never
   attempts an illegal action (self-elimination-looping, targeting an
   eliminated seat, targeting a teammate in team modes).

## Manual testing steps (smoke-test checklist)

Use this before considering any change to `src/lib/game/**` or
`party/**` "done." None of these are automated — walk through them in a
real browser against `npm run dev:all`.

### Setup
1. `npm run dev:all` — **check the terminal output for which port
   `next dev` actually bound to** (it silently falls back if 3000 is
   busy — see `PROJECT_STATE.md`'s port-collision note from this
   session). Confirm `wrangler dev` reports "Ready on
   http://localhost:8787".
2. Confirm `.env.local` has `NEXT_PUBLIC_PARTYKIT_HOST=127.0.0.1:8787`.

### Core loop (2-player, human vs AI)
3. Landing page → enter a name → "Play vs AI" → default settings →
   "Start Match".
4. Confirm the room auto-navigates and the lobby shows 2 players, one
   marked as a bot with a dealer avatar.
5. "Start the Game" → confirm the chamber loads, HP bars show, hand
   shows dealt items.
6. Fire at yourself once, fire at the opponent once — confirm turn
   passes/stays correctly per the live/blank result shown in the log.
7. Play at least one item from your hand — confirm its logged effect
   matches its description (`ITEM_INFO`).
8. Let the match play out (or force a loss) — confirm the match-end
   screen shows correctly and "Rematch" returns to a fresh lobby.

### N-player FFA
9. Repeat with "Host a Table", player count 3 and 4, multiple browser
   contexts (a normal window + an incognito window can simulate two
   different players, since identity is per-browser `localStorage`) or
   "Play vs AI" with 3–4 total seats.

### Career Mode
10. `/career` → confirm the roster grid shows only the first bot
    "current," the rest "locked."
11. Fight and beat the first bot → confirm the reward panel shows
    (level up + possibly a new item), and the second bot unlocks.
12. Refight an already-beaten bot → confirm the "already beaten" message
    (no new reward) and that no regression occurs.

### Leaderboard
13. Win a **human-hosted** match (not vs-AI) → confirm `/leaderboard`
    shows the winner's name with `wins: 1` (or incremented).
14. Win a vs-AI match as the human → confirm the leaderboard does
    **not** count it differently than expected (AI wins are excluded,
    but a human's win *in* a vs-AI room should still count — verify this
    distinction specifically, since it's easy to conflate "vs AI game"
    with "AI won").

### Team modes (2v2 Duos, Boss Battle) — currently unverified, see
`PROJECT_STATE.md`
15. "Play vs AI" (or host), 4 players, Team Mode = "2v2 Duos" → confirm
    seats `p1`+`p3` show one team badge, `p2`+`p4` show the other, and
    you cannot select a teammate in the target picker.
16. Same, Team Mode = "Boss Battle" → confirm the last seat shows a
    crown icon and visibly higher max HP, everyone else is teamed
    against them, and the boss draws more items per reload (observable
    via a larger hand after the first reload).
17. Play both to completion → confirm the match-end screen's win/loss
    framing and standings match the actual outcome (this is the step
    that had contradictory results this session — see
    `PROJECT_STATE.md`).

### Regression check after any `src/lib/game/**` change
18. `npm run typecheck && npm run typecheck:party && npm run lint &&
    npm run build` — all four must pass clean.

## Test data / fixtures / mocks

None exist — there's no test data to manage since there are no automated
tests. Manual testing uses whatever names/settings you type in by hand.

## Test environment variables

Same as development (`NEXT_PUBLIC_PARTYKIT_HOST=127.0.0.1:8787` via
`.env.local`) — no separate test-specific environment configuration
exists.

## Coverage gaps

100% of the codebase — there is no coverage tooling and no tests to
measure coverage of.

## Critical untested flows

All of them, technically, but ranked by actual risk if silently broken:

1. `redact()`'s hidden-information boundary (see above).
2. Team-mode friendly-fire/targeting rules (currently the single most
   uncertain area in the codebase — see `PROJECT_STATE.md`).
3. Reconnect/forfeit timing (`RECONNECT_GRACE_MS`, `onAlarm`) — hard to
   manually test quickly since it requires waiting out a 2-minute timer
   or temporarily shortening the constant for a test run.
4. Leaderboard win-recording exactly-once guarantee (`winnerRecorded`).

## Known flaky tests

Not applicable to committed tests (none exist). Worth recording for
institutional memory: the **ad hoc, uncommitted** Playwright script used
this session to test team modes produced **contradictory results across
repeated runs** checking for "Team A"/"Team B" badge text shortly after
a match started — see `PROJECT_STATE.md` for full detail. If a future
session writes a committed E2E test for this, budget time for the same
class of flakiness (possible causes considered: React re-render timing
relative to a scripted DOM check, dev-server port collisions with other
unrelated local projects, background-process supervision quirks specific
to the agent harness used this session — none conclusively identified as
*the* cause).

## Pre-deployment checklist

Before running `npx wrangler deploy` and/or `vercel deploy --prod`:

1. `npm run typecheck && npm run typecheck:party && npm run lint &&
   npm run build` all pass.
2. Walk the relevant subset of the manual smoke-test checklist above for
   whatever changed (don't re-test everything for a one-line UI tweak,
   but do re-test the core loop for any `state.ts` change).
3. `npx wrangler deploy --dry-run` to confirm the Worker bundle builds
   and both Durable Object bindings resolve, without actually publishing
   — safe to run any time.
4. If `src/lib/game/**` changed, deploy **both** targets together (see
   `CLAUDE.md` → Critical rules) — don't ship a Worker/client mismatch.
5. After deploying, re-verify the golden path against the **production**
   URL, not just localhost (see `DEPLOYMENT.md`).
