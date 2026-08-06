# DECISIONS.md — Architectural Decision Log

No prior ADR-style documentation existed in this repo before this audit.
Every entry below is **reconstructed from code, commit messages, and code
comments** — none of it comes from direct access to the original
developer's reasoning process (chat history was explicitly excluded per
this audit's instructions). Each entry is marked **Inferred** unless a
code comment or commit message states the reasoning explicitly, in which
case it's marked **Verified (from code comment)** or **Verified (from
commit message)**.

---

### DEC-001 — Use a Durable Object (via `partyserver`) as the sole game-state authority, not a traditional database
- **Date:** Project inception (commit `e0d401b`, "Initial build")
- **Status:** Accepted, in production
- **Context:** A real-time, low-player-count (2–4), room-scoped
  multiplayer game needs low-latency, strongly-consistent state per room,
  plus a way to hide information per-recipient.
- **Decision:** One Durable Object instance per room (`Main` class),
  holding the full authoritative `RoomState` in its own SQLite-backed
  key-value storage; no separate database.
- **Reasoning:** **Inferred.** Durable Objects give free per-room
  horizontal scaling, single-threaded per-instance consistency (no lock
  contention to reason about within a room), and colocate compute with
  storage — well-suited to a small, ephemeral, room-scoped game with no
  cross-room querying needs. A traditional database would add
  latency/complexity for no benefit at this scale and shape.
- **Alternatives (inferred, not confirmed as considered):** A
  traditional backend + Postgres/Redis with room state serialized per
  row; a peer-to-peer WebRTC approach (rejected implicitly — the design
  requires a trusted server to enforce hidden information, which p2p
  can't do without a trusted relay anyway).
- **Consequences:** No SQL, no migrations in the traditional sense, no
  cross-room analytics without custom tooling; global aggregation (the
  leaderboard) required a *separate* single global Durable Object rather
  than a query across rooms.
- **Affected files:** `wrangler.jsonc`, `party/game.ts`,
  `party/leaderboard.ts`, `src/lib/game/types.ts` (`RoomState`).

### DEC-002 — Migrate from the PartyKit CLI to `partyserver` + `wrangler`
- **Status:** Accepted, in production
- **Context:** `.gitignore` contains the comment "leftover local
  partykit dev state (migrated to wrangler)" next to an ignored
  `.partykit/` path, and a prior session's memory notes (outside this
  repo) record hitting a Cloudflare custom-domain zone limit with the
  PartyKit CLI's own deploy path.
- **Decision:** Use `partyserver` (a Durable Object framework in the
  PartyKit lineage) deployed directly via `wrangler deploy`, rather than
  the standalone `partykit` CLI.
- **Reasoning:** **Inferred** (from the `.gitignore` comment plus the
  absence of any `partykit.json`/PartyKit CLI config anywhere in the
  current repo) — `partyserver` gives the same room/connection
  programming model while deploying as an ordinary Cloudflare Worker,
  avoiding whatever platform-specific limitation the original PartyKit
  CLI deploy path hit.
- **Consequences:** Deployment is a plain `wrangler deploy`; local dev
  runs `wrangler dev --port 8787` instead of a PartyKit-specific dev
  server. This is the *only* deploy path this codebase currently
  supports — do not reintroduce a PartyKit CLI dependency without
  understanding why it was moved away from.
- **Affected files:** `wrangler.jsonc`, `party/game.ts`, `package.json`
  (`dev:party`, `deploy:party` scripts), `.gitignore`.

### DEC-003 — Share game-rule code between the Worker and the Next.js client via `src/lib/game/`, with two separate `tsconfig.json`s
- **Status:** Accepted, in production
- **Context:** Both the Worker (real authority) and the client (settings
  validation, type safety, constants) need the same `ItemId`/`GameSettings`
  types and some of the same logic (e.g. `clampSettings`).
- **Decision:** One shared module tree (`src/lib/game/`), imported by
  both `party/game.ts` (relative import,
  `../src/lib/game/state`) and Next.js code (`@/lib/game/...` alias);
  two separate `tsconfig.json` files (root + `party/tsconfig.json`) so
  neither runtime's global types leak into the other.
- **Reasoning:** **Verified (from code comment)** — `README.md`
  explicitly states: "Shared game rules/types live in `src/lib/game/`
  and are imported by both the Worker ... and the Next.js client — one
  source of truth for the state machine," and the two-tsconfig split is
  explained in `README.md`'s local-development section: "the Worker has
  its own `party/tsconfig.json` so Cloudflare Workers runtime types
  never leak into the Next.js app's global scope, and vice versa."
- **Consequences:** Any change to `src/lib/game/**` must be typechecked
  against *both* projects (`npm run typecheck` and `npm run
  typecheck:party`) and, if it changes runtime behavior, deployed to
  *both* targets together — a mismatch breaks the WS protocol contract.
- **Affected files:** `tsconfig.json`, `party/tsconfig.json`,
  everything under `src/lib/game/`.

### DEC-004 — Redact hidden information server-side before every broadcast, rather than trusting the client
- **Status:** Accepted, in production
- **Context:** The game's core tension (hidden shell order, private
  hands) only works if a player's browser genuinely cannot access
  another player's secret information — a client-side-only "hide the UI"
  approach would let anyone read the real state via devtools/network
  inspection.
- **Decision:** `redact(room, forSeat)` builds a per-recipient
  `RedactedState` — every broadcast goes through this function, and it
  is the *only* thing sent over the wire; `RoomState` (the real,
  unredacted state) never leaves the Durable Object.
- **Reasoning:** **Inferred**, but strongly supported by the code
  structure itself (there's no code path that sends `RoomState` directly)
  and by `README.md`'s explicit statement: "everything is redacted
  per-recipient before being sent ... so neither client can ever see
  hidden information by reading browser state."
- **Consequences:** Every new piece of per-player state (e.g. `team`,
  `isBoss` added for v1.8) must be deliberately added to both
  `RedactedPlayer` and the mapping inside `redact()` — it does not happen
  automatically, and forgetting it either leaks a field that should stay
  hidden (if added to `PlayerState` but also carelessly added to
  `RedactedPlayer` and `redact()` without thought) or simply isn't
  visible to the UI (if forgotten entirely). See `CLAUDE.md` → Critical
  rules.
- **Affected files:** `src/lib/game/state.ts` (`redact()`),
  `src/lib/game/types.ts` (`RoomState` vs `RedactedState`/`RedactedPlayer`).

### DEC-005 — Bots run inside the Durable Object with real randomized delays, not instantly
- **Status:** Accepted, in production
- **Context:** A bot that resolves its entire turn instantly would feel
  jarring/unfair to a human opponent and would make its decisions
  impossible to follow in the event log.
- **Decision:** `runBotIfNeeded()` loops one `runBotStep()` micro-action
  at a time, awaiting a randomized 550–1050ms delay between each,
  broadcasting state after every step.
- **Reasoning:** **Inferred** from the code shape (the delay constants
  and the step-by-step broadcast pattern have no other plausible purpose)
  — this is a deliberate UX choice to make bot turns legible in real time
  to connected humans, not a performance artifact.
- **Consequences:** A bot's full turn can take several real seconds
  across multiple micro-actions; `BOT_STEP_LIMIT` (25) exists as a safety
  cap against a pathological loop (e.g. repeated blank self-shots)
  running unbounded.
- **Affected files:** `src/lib/game/state.ts`
  (`botActionDelayMs`, `runBotStep`, `BOT_STEP_LIMIT`),
  `party/game.ts` (`runBotIfNeeded`).

### DEC-006 — Bot "skill" scales which decisions a bot makes well, not what it knows
- **Status:** Accepted, in production
- **Context:** Career Mode needs bots of meaningfully different
  difficulty (`BOT_ROSTER`'s `skill: 0.1` → `1`).
- **Decision:** `runBotStep()` re-rolls `Math.random() < skill` before
  attempting any "smart" item play; a peeked shell's *known* value is
  always honored regardless of skill (a bot never "forgets" what it just
  looked at) — only the odds-based *guess* when nothing is known scales
  with skill.
- **Reasoning:** **Verified (from code comment)** — the comment directly
  above this logic in `state.ts` states: "it doesn't forget how the
  items work, it's just worse at knowing when to use them" and "Already-
  known information (from a peek) is always honored ... Only the
  odds-based guess when nothing is known scales with skill."
- **Consequences:** A "weak" bot still plays every item *correctly* when
  it does play one — it's just less likely to choose to. This keeps
  low-skill bots from looking "broken" rather than "unskilled."
- **Affected files:** `src/lib/game/state.ts` (`runBotStep`),
  `src/lib/game/bots.ts` (`BOT_ROSTER.skill`).

### DEC-007 — Team modes are a single `TeamMode` enum unifying "2v2 Duos" and "Boss Battle" over shared primitives, not two separate feature branches
- **Date:** This session (uncommitted, v1.8 in progress)
- **Status:** Accepted, in production (shipped as v1.8, 2026-08-06).
- **Context:** The user requested both a 2v2 mode and a boss-raid mode in
  the same request.
- **Decision:** `TeamMode = "none" | "duos" | "boss"`; both non-"none"
  values reuse the same `assignTeams()`/`isTeammate()`/`roundOver()`/
  friendly-fire-blocking machinery, differing only in *how* teams are
  assigned (`duos`: alternating seat index; `boss`: last seat is its own
  team of one) and in boss-specific HP/item bonuses layered on top.
- **Reasoning:** **Inferred** from the resulting code shape — minimizes
  duplicated logic (one team-elimination check instead of two,
  one friendly-fire gate instead of two) at the cost of `bossSeatOf()`
  needing a special case inside otherwise-shared functions.
- **Alternatives considered (inferred from what the code does NOT do):**
  Two independent boolean flags (`isDuos`, `isBoss`) were not used — a
  single enum was chosen instead, which also cleanly prevents an
  invalid "both duos and boss" combination from being representable at
  all.
- **Consequences:** Adding a *third* team-mode variant later should
  follow the same pattern (extend the enum, extend `assignTeams()`,
  reuse `isTeammate()`/`roundOver()` as-is) rather than introducing a
  parallel code path.
- **Affected files:** `src/lib/game/types.ts` (`TeamMode`),
  `src/lib/game/state.ts` (`assignTeams`, `bossSeatOf`, `isTeammate`,
  `roundOver`, `clampSettings`).

### DEC-008 — Boss seat is always the last active seat
- **Date:** This session (uncommitted, v1.8 in progress)
- **Status:** Accepted, in production (shipped as v1.8, 2026-08-06).
- **Context:** Boss Battle needs a deterministic, simple rule for "who
  is the boss," and should work sensibly in vs-AI games where bots fill
  seats after the host.
- **Decision:** `bossSeatOf()` returns `activeSeats(room)[length - 1]` —
  always the last seat in player-count order (e.g. `p4` for a 4-player
  game).
- **Reasoning:** **Verified (from code comment)** — `state.ts`: "In boss
  mode, the boss is always the last active seat — the last bot filled, in
  vs-AI games." This deliberately makes "party vs. AI boss" work for
  free in vs-AI flows without any extra boss-selection UI, since
  `fillRemainingSeatsWithBots` fills non-host seats in order and the host
  is always `p1`.
- **Consequences:** In a *human-hosted* room (not vs-AI), the boss is
  whichever human happens to claim the last seat to join — there is no
  "boss selection" UI; this is implicit and could surprise a human host
  who expected to choose. Not currently flagged as a bug, just a design
  choice worth knowing.
- **Affected files:** `src/lib/game/state.ts` (`bossSeatOf`).

### DEC-009 — Team-mode matches are forced to a single round (`roundsToWin = 1`)
- **Date:** This session (uncommitted, v1.8 in progress)
- **Status:** Accepted, in production (shipped as v1.8, 2026-08-06).
- **Context:** Multi-round matches track wins per-seat
  (`RoomState.roundWins: Record<SeatId, number>`); team modes would need
  per-*team* score tracking to support a "best of 3" team match.
- **Decision:** `clampSettings()` forces `roundsToWin = 1` whenever
  `teamMode !== "none"`.
- **Reasoning:** **Inferred** from the code shape — this sidesteps
  needing new per-team scoring infrastructure entirely, mirroring the
  same simplification already used for Career Mode matches (also
  single-round).
- **Consequences:** A future "best-of-3 team match" feature would need
  new scoring infrastructure (per-team win counts, not just per-seat) —
  not a small addition on top of the current data model.
- **Affected files:** `src/lib/game/state.ts` (`clampSettings`).

### DEC-010 — Career Mode progression is entirely client-side (`localStorage`), not server-authoritative
- **Status:** Accepted, in production (since Career Mode's introduction,
  commit `3a26ab9`)
- **Context:** No accounts/auth system exists; Career Mode needs *some*
  persistence for "which bots have you beaten."
- **Decision:** `src/lib/career.ts` reads/writes a single
  `localStorage` key (`chamber-seven:career`); the underlying career
  *match* is a real server-authoritative game, but the *progression*
  (level, unlocks) is purely client-tracked.
- **Reasoning:** **Inferred** — the only persistence option available
  without adding an accounts system; consistent with the rest of the
  app's "no server-side user data beyond room state and leaderboard
  names" posture.
- **Consequences:** Career progress is per-browser, not per-person —
  clearing `localStorage` or switching devices/browsers loses all
  progress, with no recovery mechanism. Not currently flagged as a bug;
  a reasonable tradeoff for a no-accounts hobby project, but worth
  knowing before promising users their progress is "saved" in any
  durable sense.
- **Affected files:** `src/lib/career.ts`.

### DEC-011 — Leaderboard entries are keyed by lowercased display name with no ownership check
- **Status:** Accepted, in production (since the leaderboard's
  introduction, v1.5)
- **Context:** No accounts/auth system exists to tie a "real" identity to
  a win.
- **Decision:** `party/leaderboard.ts`'s `recordWin(name)` keys storage
  by `name.trim().toLowerCase()` — whoever's browser reports that name
  string gets the win added to that entry, with no verification.
- **Reasoning:** **Inferred** — again, the only option without an
  accounts system; a deliberate simplicity/scope tradeoff rather than an
  oversight (the leaderboard explicitly only tracks *human* wins,
  showing awareness of at least the AI-win exclusion case).
- **Consequences:** See `SECURITY.md` — this is a real, exploitable trust
  gap if the leaderboard is ever treated as meaningful/competitive rather
  than a lighthearted vanity feature. Documented as a known limitation,
  not silently left undocumented.
- **Affected files:** `party/leaderboard.ts`.

### DEC-012 — Extract team assignment into a pure function so the lobby can safely preview it
- **Date:** 2026-08-06
- **Status:** Accepted, in production
- **Context:** Teams weren't assigned until `beginRound()` actually ran
  (server-side, at match start), so the pre-game lobby had no way to
  show players which team they'd be on. The obvious naive fix — writing
  separate preview logic in `Lobby.tsx` that guesses the same rule —
  would risk silently drifting from the real `assignTeams()` rule if
  either one were changed later without updating the other.
- **Decision:** Extracted the actual assignment rule into
  `teamForSeatIndex(teamMode, index, seatCount): 0 | 1 | null`, a pure
  function taking only the inputs that determine team placement (no
  `RoomState`, no hidden information). `assignTeams()` now calls this
  same function per seat; `Lobby.tsx` calls it too, directly on
  `state.settings.teamMode` and each player's index in the (already
  seat-ordered) `players` array.
- **Reasoning:** Single source of truth for a rule now used in two
  places (server authority + client preview), verified safe to preview
  ahead of time because team placement depends only on seat order and
  the match settings — neither is hidden information, so there is no
  redaction concern in exposing it before the round is dealt (contrast
  with `redact()`'s hand/shell-order redaction, which exists precisely
  because *that* information is hidden until revealed).
- **Consequences:** Any future change to the team-assignment rule (e.g.
  a new `TeamMode` variant) only needs to change `teamForSeatIndex()`
  once; both the engine and the lobby preview pick it up automatically.
- **Affected files:** `src/lib/game/state.ts`, `src/components/game/Lobby.tsx`.
