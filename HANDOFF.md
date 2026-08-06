# HANDOFF.md — Start Here

You are picking up **Chamber Seven** with no memory of any prior
conversation. This file is your fastest path to being useful. Everything
here is backed by the other memory files in this repo root, all written
2026-08-06 from a direct audit of the actual code — not from chat
history. **As of the latest session (2026-08-06), the feature this
memory system was built around (v1.8 team modes) has shipped and been
verified in production** — see `SESSION_LOG.md`'s latest entry for the
full record. There is no urgent open task right now.

## What is this project?

A browser-based, real-time multiplayer shotgun-duel game (2–4 players:
free-for-all, 2v2, or 1-vs-all "boss" mode; humans and/or AI bots in any
mix), plus a single-player Career Mode ladder against 12 named bots.
Next.js frontend on Vercel, a Cloudflare Worker (Durable Objects, via
`partyserver`) as the authoritative real-time backend. No accounts, no
payments — a display name and a browser is all a player needs.

Full detail: `CLAUDE.md` (read this in full before doing anything else —
it's the operating manual).

## What should I read first?

In order:
1. `CLAUDE.md` — identity, stack, conventions, critical rules.
2. `PROJECT_STATE.md` — the exact stopping point, right now.
3. `TASKS.md` — what's queued, starting with the current task.
4. Whichever of `ARCHITECTURE.md` / `FEATURES.md` / `API_REFERENCE.md` /
   `DATABASE.md` / `UI_SYSTEM.md` / `SECURITY.md` / `DEPLOYMENT.md` /
   `DECISIONS.md` is relevant to what you're about to do.

## What is the current task?

**Nothing is currently in progress.** The v1.8 team-mode feature (2v2
Duos, Boss Battle) shipped and was verified live in production on
2026-08-06. There is no user-directed active task right now. The best
next pick from the backlog is `TASKS.md` → `TASK-004` (Career Mode's
changelog claims a visual feature — escalating venue backdrops — that
isn't actually wired up; either wire it or correct the claim), but
don't start it unprompted if the user has something else in mind —
confirm first.

## What was the previous agent doing?

Four things, in order, across what reads as one continuous engagement:
1. Implementing the team-mode feature (engine changes, UI changes).
2. At the user's request, pausing to perform a full documentation/
   handoff audit (the memory system you're reading now).
3. A follow-up "final account-switch checkpoint" pass (same day):
   re-verified git state, tightened `TASKS.md`'s task structure, fixed
   one real bug (`.env.example` silently gitignored by the broad
   `.env*` pattern).
4. When the user then said "continue building the game from where it
   left off in the memory": resolved the one open question
   (`TASK-002` — does the team-mode UI actually work?) via a
   screenshot-based check (bypassing the earlier ambiguous
   text-matching test evidence entirely), confirmed it does, **committed,
   deployed both targets, and verified live in production** — including
   a screenshot taken directly against the production URL.

## What works right now?

Everything through v1.8, confirmed live in production: core duel loop,
2–4 player FFA, vs-AI bots, all 23 items, customizable item pools, 5
cosmetic themes, Career Mode (12-bot ladder), the global leaderboard,
reconnect handling, and now 2v2 Duos / Boss Battle team modes. See
`FEATURES.md` for the full, individually-verified status of each
(update `FEATURES.md`'s team-mode entry from "Partially implemented" to
reflect this if you're the one reading it fresh — it may not have been
updated in the same pass as this file, double-check).

## What is broken?

Nothing is confirmed broken in what's live in production. One known
issue remains: **Career Mode's changelog claims "escalating venue
backdrops" that don't actually exist in the shipped UI** —
`public/venues/*.png` are dead, unreferenced assets. See `FEATURES.md`
→ Career Mode, `TASKS.md` `TASK-004`.

## What should I do next?

Nothing is blocking or urgent. If the user hasn't given new direction,
either ask what they want next, or propose `TASK-004` as the smallest,
best-scoped item in the backlog (see `TASKS.md` → High priority).

## Which files are most important?

- `src/lib/game/state.ts` — the entire game engine, shared by both
  deploy targets. Read `CLAUDE.md` → Critical rules before touching it.
- `src/lib/game/types.ts` — the shared type/protocol definitions.
- `party/game.ts` — the Worker entrypoint / real-time authority.
- `src/hooks/useGameRoom.ts` — the client's one connection point to all
  of the above.

Full annotated map: `FILE_MAP.md`.

## Which areas are dangerous to modify?

See `CLAUDE.md` → "DO NOT CHANGE WITHOUT REVIEW" for the full list.
Headline: `redact()` in `state.ts` (the only thing preventing hidden
game information from leaking to clients), the Durable Object bindings/
migrations in `wrangler.jsonc`, and the WS protocol shapes in
`types.ts` (a mismatch between the two deploy targets breaks live
rooms).

## Which commands should I run first?

```bash
cd ~/Projects/chamber-seven
git status                    # confirm this matches what PROJECT_STATE.md describes — don't assume, check
npm install                   # if node_modules isn't already present
npx wrangler types             # REQUIRED on a fresh clone — see DEPLOYMENT.md, worker-configuration.d.ts is gitignored
npm run typecheck && npm run typecheck:party && npm run lint && npm run build
```
All four should pass clean. If any of them fail, or if `git status`
shows something `PROJECT_STATE.md` doesn't mention, something has
changed since the last update — refresh `PROJECT_STATE.md` with what
you find before proceeding.

## How do I verify the app still works?

```bash
npm run dev:all
```
Then check the terminal for which port `next dev` actually bound to
(don't assume 3000 — see `PROJECT_STATE.md`'s port-collision note), open
it in a browser, and walk the relevant part of `TESTING.md`'s manual
smoke-test checklist. There is no automated test suite (see
`TESTING.md`) — manual/in-browser verification is currently the only way
to confirm behavior, not just compilation.

---

## Prompt for the next Claude Code account

Copy-paste this to start a new session cleanly:

```
Read CLAUDE.md, PROJECT_STATE.md, and TASKS.md in full before doing
anything else. Then:

1. Run `git status` and `git log --oneline -5` and confirm the repo
   state matches what PROJECT_STATE.md describes. If it doesn't
   (someone else has committed/changed things since), stop and tell me
   what's different before proceeding.
2. Run the verification suite: `npm run typecheck && npm run
   typecheck:party && npm run lint && npm run build`. Confirm all four
   still pass.
3. In 3-5 sentences, summarize your understanding of: what this
   project is, what the current task is, and what specifically is
   blocking it. I want to confirm you've actually absorbed the memory
   files, not just skimmed them.
4. Flag anything in CLAUDE.md/PROJECT_STATE.md/TASKS.md/FEATURES.md
   that looks stale or contradicts what you find in the actual code —
   don't silently work around a contradiction, surface it.
5. Check TASKS.md's "Current task" section — if it says nothing is in
   progress, ask me what to work on next rather than guessing; don't
   assume the backlog's suggested next item (TASK-004 as of this
   writing) is what I want without confirming.
6. Preserve the existing architecture (Durable Objects via partyserver,
   the shared src/lib/game/ engine, the redact() information boundary)
   unless you find a genuinely strong reason to change it — and if you
   do, write it up in DECISIONS.md rather than changing it silently.
7. After completing any meaningful work, update PROJECT_STATE.md,
   TASKS.md, and append to SESSION_LOG.md before ending your session —
   don't let the next handoff start from a stale snapshot.
```
