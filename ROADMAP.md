# ROADMAP.md — Product Roadmap

**Important framing note:** No roadmap document existed in this repo
before this audit, and no time estimates exist anywhere in the codebase
or commit history. Everything below is **reconstructed from the actual
shipped version history** (`src/lib/changelog.ts`, `git log`) plus
**inferred** next steps based on what's in progress or explicitly flagged
as incomplete. Items are not dated except where a version was actually
shipped. Do not add invented time estimates.

## Current milestone

**v1.8 — Team modes (2v2 Duos, Boss Battle)**
- **Objective:** Add cooperative/asymmetric multiplayer variants on top
  of the existing FFA engine.
- **Priority:** High (active work)
- **Status:** Code-complete, unverified at runtime, undeployed — see
  `PROJECT_STATE.md` and `TASKS.md` `TASK-001`/`TASK-002`.
- **Dependencies:** None beyond the existing engine.
- **Difficulty:** Medium (touched the core state machine, but the
  no-friendly-fire / team-elimination pattern reuses existing primitives
  rather than introducing new ones).
- **Risk:** Medium — see `PROJECT_STATE.md` for the specific unresolved
  verification risk.
- **Definition of done:** See `TASKS.md` `TASK-001` acceptance criteria.

## Next milestone

**Post-v1.8 cleanup pass**
- **Objective:** Resolve the loose ends this audit surfaced rather than
  letting them accumulate: the venue/tier image discrepancy
  (`TASK-004`), the dev-host fallback inconsistency (`TASK-005`), the
  unused `zustand` dependency (`TASK-006`), and (optional) a lobby team
  preview (`TASK-007`).
- **Priority:** Medium
- **Status:** Planned
- **Dependencies:** v1.8 shipping first is not strictly required for
  most of these (they're independent), but bundling them into the next
  release after v1.8 is a reasonable default unless the user wants them
  sooner.
- **Difficulty:** Low individually.
- **Risk:** Low.
- **Definition of done:** Each linked task's acceptance criteria in
  `TASKS.md`.

## MVP completion

**Already reached, and then some.** The game already has: real-time
multiplayer, AI opponents, a 12-bot single-player campaign, a 22-item pool
(23 at the original time of this audit; Overdose was removed in v1.19,
2026-08-07 — see `CHANGELOG.md`/`FEATURES.md`), 5 cosmetic themes plus a
10-style/upload-your-own background picker (v1.15–v1.18), team-based
modes (2v2 Duos, Boss Battle, shipped), and a cross-match leaderboard.
There is no "MVP" gap remaining in the sense of "core loop doesn't work"
— remaining work is polish, correctness verification, and technical
debt, not missing fundamentals.

## Post-MVP

Ideas that would extend beyond the current feature set, **inferred** from
patterns already in the codebase (not confirmed as actual plans — flag to
the user before investing significant effort):

- **Spectator mode** — the room/seat model (`ALL_SEATS`, capped at 4)
  has no concept of a non-playing observer; would need a new connection
  role.
- **More team-mode variants** — the `TeamMode` union
  (`"none"|"duos"|"boss"`) is designed to be extensible (see
  `DECISIONS.md`); a 3-player "2v1" or a "free-for-all with alliances"
  mode would follow the same `assignTeams()`/`isTeammate()`/`roundOver()`
  pattern.
- **Persistent accounts** — would unlock a trustworthy leaderboard (see
  `SECURITY.md`'s leaderboard gap) and cross-device Career Mode progress
  (currently `localStorage`-only, lost if cleared or switching devices).
- **More Career Mode content** — the roster/tier system
  (`BOT_ROSTER`, `tier: 1-6`) already groups bots into 6 "venues"; the
  unused `public/venues/*.png` assets suggest this was at least sketched
  out as a visual progression system (see `TASK-004`).

## Long-term ideas

Speculative, **not** grounded in any in-repo evidence beyond general
project shape — treat as brainstorm only:

- Mobile-native wrapper (the UI is already responsive Tailwind, so a
  PWA manifest might be a low-effort step before a full native app).
- Tournament/bracket mode built on top of the existing room-code system.
- Cosmetic unlocks tied to Career Mode completion (beyond the current
  HP/item unlocks).

## Optional improvements

- Lobby team-mode preview (`TASK-007`).
- Shared `<Nav>` component to de-duplicate the repeated page headers
  (see `TASKS.md` → Technical debt).
- Splitting `state.ts` by concern if it continues to grow (see
  `TASKS.md` → Technical debt) — explicitly **not** urgent at its
  current size.

## Out of scope

Explicitly not part of this project based on its current architecture
and the absence of any supporting code:

- **Payments/monetization** — no payment integration exists or is
  implied by anything in the codebase.
- **User accounts/authentication** — a deliberate absence so far (see
  `SECURITY.md`); would be a significant architectural addition, not a
  small feature.
- **Native mobile app** — web-only currently; nothing in the repo
  suggests otherwise.
- **Server-authoritative Career Mode progress** — currently
  `localStorage`-only by design (see `DECISIONS.md`); making it
  server-authoritative would require the accounts system above.
