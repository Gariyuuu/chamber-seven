# HANDOFF.md — Start Here

You are picking up **Chamber Seven** with no memory of any prior
conversation. This file is your fastest path to being useful. Everything
here is backed by the other memory files in this repo root, all written
2026-08-06 from a direct audit of the actual code — not from chat
history. This file was re-confirmed at a second checkpoint the same day
(see `SESSION_LOG.md`'s second entry) — **nothing about the current task
or repo state changed between the two passes**, the checkpoint just
re-verified everything was still accurate and tightened a few files.

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

**Finish verifying and ship the 2v2 Duos / Boss Battle team-mode
feature (v1.8).** It's fully coded, uncommitted, and passes every static
check (`typecheck` × 2, `lint`, `build`) — but its actual in-browser
behavior was never conclusively confirmed. See `TASKS.md` `TASK-001` and
`TASK-002` for the exact next steps, and `PROJECT_STATE.md` for the full
history of what was tried.

## What was the previous agent doing?

Three things, in order:
1. Implementing the team-mode feature above (the bulk of the technical
   work — engine changes, UI changes, all uncommitted).
2. Then, at the user's explicit request, pausing that work to perform a
   full documentation/handoff audit (everything you're reading now) —
   so that if the team-mode work needed to hand off to a fresh session
   (like you), nothing would be lost.
3. Then a follow-up "final account-switch checkpoint" pass (same day):
   re-verified `git status`/`git log` matched what the audit had
   recorded, tightened `TASKS.md`'s current task into an explicit
   objective/completed/remaining/known-errors/blockers/acceptance-
   criteria/verification-steps structure, and fixed one real bug found
   in the process — `.env.example` was silently being swallowed by
   `.gitignore`'s broad `.env*` pattern (added a `!.env.example`
   negation to fix it).

**The team-mode work itself was not resumed at any point** — that's
still sitting exactly where it was left, uncommitted, unverified. Both
documentation passes were deliberately scoped to *not* touch product
code (see `CLAUDE.md`/`PROJECT_STATE.md` for the one exception: the
`.gitignore` fix, which is a doc-adjacent repo-hygiene fix, not a
product/game behavior change).

## What works right now?

Everything through v1.7, confirmed live in production:
core duel loop, 2–4 player FFA, vs-AI bots, all 23 items, customizable
item pools, 5 cosmetic themes, Career Mode (12-bot ladder), the global
leaderboard, reconnect handling. See `FEATURES.md` for the full,
individually-verified status of each.

## What is broken?

Nothing is confirmed *broken* in what's live in production. Two real
issues to know about:
1. **Career Mode's changelog claims "escalating venue backdrops" that
   don't actually exist in the shipped UI** — `public/venues/*.png` are
   dead, unreferenced assets. See `FEATURES.md` → Career Mode,
   `TASKS.md` `TASK-004`.
2. **The uncommitted team-mode feature's runtime behavior is unverified**
   — see above. This is the most important open question in the repo
   right now.

## What should I do next?

Start with `TASKS.md` `TASK-002` — a clean, **manual, real-browser**
(not scripted) check of both new team modes. This is deliberately the
first recommendation because it's the fastest way to convert an
ambiguous situation into a confident yes/no, unblocking everything else
queued behind it (`TASK-001`'s commit/deploy steps).

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
git status                    # confirm you're starting from the expected dirty state (see PROJECT_STATE.md)
npm install                   # if node_modules isn't already present
npx wrangler types             # REQUIRED on a fresh clone — see DEPLOYMENT.md, worker-configuration.d.ts is gitignored
npm run typecheck && npm run typecheck:party && npm run lint && npm run build
```
All four should pass clean, matching this audit's findings. If any of
them fail, something has changed since this audit — update
`PROJECT_STATE.md` with what you find before proceeding.

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
5. Then continue TASK-002 from TASKS.md (root-cause / confirm the
   team-mode runtime behavior) before doing anything else — this is the
   single task blocking everything queued behind it.
6. Preserve the existing architecture (Durable Objects via partyserver,
   the shared src/lib/game/ engine, the redact() information boundary)
   unless you find a genuinely strong reason to change it — and if you
   do, write it up in DECISIONS.md rather than changing it silently.
7. After completing any meaningful work, update PROJECT_STATE.md,
   TASKS.md, and append to SESSION_LOG.md before ending your session —
   don't let the next handoff start from a stale snapshot.
```
