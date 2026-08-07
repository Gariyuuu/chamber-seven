# HANDOFF.md — Start Here

You are picking up **Chamber Seven** with no memory of any prior
conversation. This file is your fastest path to being useful. The memory
files were originally written 2026-08-06 from a direct audit of the
actual code, and refreshed 2026-08-07 via a documentation checkpoint that
caught up 9 shipped-but-undocumented versions. **As of the latest
checkpoint (2026-08-07), the repo is at v1.21, `main` is fully pushed to
`origin/main` (0 ahead/behind), and there is no open task.** See
`SESSION_LOG.md`'s top entry for the full record.

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

**Nothing is currently in progress and nothing is queued.** Both v1.8
(team modes) and the full follow-up backlog (`TASK-004`–`TASK-008`)
have shipped and been verified live in production. `TASKS.md` →
"Current task" says "None." Don't invent new work — wait for the user's
next direction.

## Something the user needs to confirm/decide

**Nothing outstanding.** The 2026-08-06 checkpoint below flagged local
`main` as 9 commits ahead of `origin/main`, never pushed. Re-checked
2026-08-07 via a fresh `git fetch origin`: that gap is gone — `main` is
now **0 ahead / 0 behind `origin/main`**, fully pushed at `1f9ec83`
(v1.21). Nine more commits (v1.13–v1.21) were also shipped and pushed in
the interim. No git action is needed from the user right now.

## What was the previous agent doing?

**Most recently (2026-08-07):** a pure documentation checkpoint — no
product code changed. Re-verified git state (found the 9-ahead gap from
2026-08-06 had been resolved, and 9 further versions shipped, v1.13
through v1.21), re-ran the full verification suite (all four commands
clean), fixed a real cross-file contradiction (item count "23" →
"22" after v1.19 removed Overdose — `README.md` had even still named
Overdose as an existing item), re-confirmed `.env.example` is still
correctly tracked, and refreshed this file plus `PROJECT_STATE.md` /
`CLAUDE.md` / `TASKS.md` / `FEATURES.md` / `ROADMAP.md` / `UI_SYSTEM.md`
/ `SESSION_LOG.md` / `CHANGELOG.md`. Full detail in `SESSION_LOG.md`'s
top entry.

**Before that (2026-08-06/07, undocumented at the time — reconstructed
from `git log` during the above checkpoint):** 9 more shipped versions,
v1.13–v1.21 — background art overhaul (PNG felt-table design, then a
10-style picker + custom upload), a UI bugfix (off-center subtitle), a
balance change (Overdose removed, Patch Kit capped), and a jump-scare
animation upgrade across two versions. All committed and pushed, but
none of these sessions updated the memory-file system — see `CLAUDE.md`
→ Known issues #8 for the process-gap note this created.

**Earlier (2026-08-06), five things, in order, across what reads as one
continuous engagement:**
1. Implementing the team-mode feature (engine changes, UI changes).
2. At the user's request, pausing to perform a full documentation/
   handoff audit (the memory system you're reading now).
3. A follow-up "final account-switch checkpoint" pass (same day):
   re-verified git state, tightened `TASKS.md`'s task structure, fixed
   one real bug (`.env.example` silently gitignored by the broad
   `.env*` pattern).
4. When the user said "continue building the game from where it left
   off in the memory": resolved the one open question (`TASK-002` —
   does the team-mode UI actually work?) via a screenshot-based check,
   confirmed it does, committed, deployed both targets, and verified
   live in production.
5. When the user then said "do all the other tasks unfinished, only
   tell me when ur done with every single task left": cleared the
   entire remaining backlog (`TASK-004`–`TASK-008`) — Career Mode venue
   backdrops, dev-host fallback fix, `zustand` removal, lobby team
   preview, README update — verified each with typecheck/lint/build
   plus screenshots, committed as 5 separate commits, deployed both
   targets again, and re-verified against production.

## What works right now?

Everything through **v1.21**, confirmed live in production (checked
directly via `curl` against `/changelog` and `/leaderboard`, 2026-08-07):
core duel loop, 2–4 player FFA, vs-AI bots, a 22-item pool (23 before
v1.19 removed Overdose) with customizable item pools, 5 cosmetic themes
each with 10 selectable background styles plus a custom-upload option,
Career Mode (12-bot ladder, with escalating venue backdrops), the global
leaderboard, reconnect handling, 2v2 Duos / Boss Battle team modes
(previewed in the lobby before the match starts), a `/tutorial` page
(rules + full item glossary, auto-generated so it can't drift), a
`/lessons` page (strategy tips), and a multi-beat jump-scare animation
with HUD damage-trail polish. See `FEATURES.md` for the full,
individually-verified status of each (note: `FEATURES.md`'s deep-dive
descriptions of the background-style system and jump-scare weren't
rewritten in full this checkpoint, only the item count — see
`UI_SYSTEM.md`'s flagged gap).

## What is broken?

Nothing is confirmed broken in what's live in production. One
deliberately-deferred item: `npm audit` (surfaced while removing
`zustand`) reports vulnerabilities in `undici`, transitively via
`wrangler`'s bundled `miniflare` (dev-only tooling, not the deployed
Worker runtime) — the automatic fix would force-downgrade `wrangler` by
~80 versions, judged too risky to apply as a side effect of an
unrelated cleanup task. See `SECURITY.md` / `TASKS.md` → Technical debt.
Not re-verified this checkpoint (no `npm install`/lockfile change
happened), so treat as last-checked 2026-08-06.

## What should I do next?

Nothing is blocking or urgent. Ask the user what they want next. If
you're touching the background-art system or `UI_SYSTEM.md`, note that
file has a flagged, not-yet-done rewrite (see its background-art
section) — a good candidate task if the user wants documentation debt
paid down rather than new features.

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

1. Run `git status`, `git log --oneline -5`, and `git fetch origin`
   (read-only) and confirm the repo state matches what PROJECT_STATE.md
   describes — as of the 2026-08-07 checkpoint, `main` is fully pushed
   to `origin/main` (0 ahead / 0 behind, HEAD `1f9ec83`, v1.21). Don't
   trust that this is still true — confirm it fresh; a prior checkpoint
   (2026-08-06) recorded a 9-commits-ahead-never-pushed gap that this
   memory system didn't catch for a full day and 9 more versions. If
   anything doesn't match what PROJECT_STATE.md says, stop and tell me
   what's different before proceeding.
2. Run the verification suite: `npm run typecheck && npm run
   typecheck:party && npm run lint && npm run build`. Confirm all four
   still pass (all four were clean as of 2026-08-07).
3. In 3-5 sentences, summarize your understanding of: what this
   project is, what the current task is, and what specifically is
   blocking it. I want to confirm you've actually absorbed the memory
   files, not just skimmed them.
4. Flag anything in CLAUDE.md/PROJECT_STATE.md/TASKS.md/FEATURES.md
   that looks stale or contradicts what you find in the actual code —
   don't silently work around a contradiction, surface it. Known
   pre-existing gap as of this writing: `UI_SYSTEM.md`'s background-art
   section describes the v1.10 SVG system, not the actual current
   PNG/10-style/upload system shipped in v1.14–v1.18 — it has a patch
   note flagging this but hasn't been fully rewritten.
5. Check TASKS.md's "Current task" section — if it says nothing is in
   progress or queued (true as of this writing), ask me what to work on
   next rather than guessing or inventing work.
6. Preserve the existing architecture (Durable Objects via partyserver,
   the shared src/lib/game/ engine, the redact() information boundary)
   unless you find a genuinely strong reason to change it — and if you
   do, write it up in DECISIONS.md rather than changing it silently.
7. After completing any meaningful work — even a single small fix —
   update PROJECT_STATE.md, TASKS.md, and append to SESSION_LOG.md
   before ending your session. This was skipped for 9 consecutive
   shipped versions (v1.13–v1.21) before this checkpoint caught it up;
   don't repeat that. A one-line SESSION_LOG.md append is enough to
   prevent multi-version drift — it doesn't need to be exhaustive.
```
