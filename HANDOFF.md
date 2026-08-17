# HANDOFF.md — Start Here

You are picking up **Chamber Seven** with no memory of any prior
conversation. This file is your fastest path to being useful. The memory
files were originally written 2026-08-06 from a direct audit of the
actual code, refreshed 2026-08-07 via a documentation checkpoint that
caught up 9 shipped-but-undocumented versions, and refreshed again
2026-08-17 via a checkpoint that found the exact same drift pattern
recurring — plus direct evidence that this repo's checkout is shared
across concurrent Claude Code sessions (like `~/Projects/yuuki-outreach`
is documented to be). **As of the latest checkpoint (2026-08-17): `main`
is fully pushed (`5be92bc`, 0 ahead/behind `origin/main`), a branch
merge (`chore/polish` → `main`) happened mid-checkpoint via a concurrent
session and is confirmed deployed, and there is no task in progress.**
See `SESSION_LOG.md`'s top entry for the full record.

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

**`TASK-010` (`T-010`), and it's optional/non-blocking.** No feature
work is in progress. `TASK-009` (merge `chore/polish` into `main`?) was
resolved mid-checkpoint — see below. `TASKS.md` → "Current task" points
at `TASK-010`: add `src/lib/changelog.ts` entries for the 3 commits
shipped 2026-08-13–08-15 (all now on `main`). Nothing else is queued.

## Something the user needs to confirm/decide

**Nothing outstanding right now.** `TASK-009` (should `chore/polish` be
merged into `main`?) was the open question at the start of this
checkpoint. Before it could be asked, **a different, concurrent Claude
Code session sharing this checkout merged and deployed it** (`5be92bc`,
2026-08-17T00:17:49-07:00, confirmed pushed to `origin/main` and
deployed via `vercel ls`). This wasn't this session's action — flagging
it so you don't assume a "resolved" task in this file always means a
session actually did the work described. See `PROJECT_STATE.md`'s
"2026-08-17, continued" section and `CLAUDE.md` → Known issues #9 for
the shared-checkout finding this surfaced.

## What was the previous agent doing?

**Most recently (2026-08-17):** a repo-memory onboarding checkpoint, no
user present to ask questions mid-task. Found and reconciled 3 real
commits (2026-08-13–08-15) that had shipped with no memory-file update
and no `src/lib/changelog.ts` entry — see `CLAUDE.md` → Known issues #9.
Confirmed via direct `curl` against production that 2 of the 3
(reduced-motion fix, OG/robots/sitemap metadata) were already live on
`main`; the third (neon/glitch match-outcome effect) was found on an
unmerged `chore/polish` branch and `TASK-009` was opened to ask the user
about merging it — but **while this checkpoint was still writing
documentation, a separate concurrent session merged and deployed it
first.** This session re-verified the new state (`git branch`, `git
log`, `vercel ls`) and updated the docs accordingly rather than leaving
the now-stale "open decision" framing in place. Updated
`PROJECT_STATE.md`, `CLAUDE.md`, `TASKS.md` (`TASK-009` done,
`TASK-010` open), `FEATURES.md` (2 new entries), `UI_SYSTEM.md`
(Accessibility additions), this file, `CHANGELOG.md`, `SESSION_LOG.md`.
No product code, merge, deploy, or push was performed **by this
session** — the merge/deploy that did happen was the concurrent
session's action, observed and documented, not caused by this one.

**Before that (2026-08-07):** a pure documentation checkpoint — no
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

Everything through **v1.21** plus 3 undocumented-until-now commits, all
now confirmed merged into `main`: core duel loop, 2–4 player FFA, vs-AI
bots, a 22-item pool (23 before v1.19 removed Overdose) with
customizable item pools, 5 cosmetic themes each with 10 selectable
background styles plus a custom-upload option, Career Mode (12-bot
ladder, with escalating venue backdrops), the global leaderboard,
reconnect handling, 2v2 Duos / Boss Battle team modes (previewed in the
lobby before the match starts), a `/tutorial` page (rules + full item
glossary, auto-generated so it can't drift), a `/lessons` page (strategy
tips), a multi-beat jump-scare animation with HUD damage-trail polish
(itself now `prefers-reduced-motion`-aware, `97185d3`), OpenGraph/
robots.txt/sitemap metadata (`5816555` — confirmed live via `curl`
2026-08-17), and a neon/glitch match-outcome headline effect (`42c03f9`,
merged via `5be92bc` mid-checkpoint by a concurrent session — deployment
inferred from a fresh Vercel Production listing, not independently
re-`curl`'d/rendered by this session, see `PROJECT_STATE.md`). See
`FEATURES.md` for the full, individually-verified status of each (note:
`FEATURES.md`'s deep-dive descriptions of the background-style system
and jump-scare weren't rewritten in full during the 2026-08-07
checkpoint, only the item count — see `UI_SYSTEM.md`'s flagged gap,
still open as of 2026-08-17).

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

**Re-verify `git branch --show-current` and `git log -1` before doing
anything else** — this checkpoint's own experience (see `CLAUDE.md` →
Known issues #9) is proof that this repo's checkout can change under
you mid-session via a concurrent Claude Code session. Beyond that,
nothing is blocking or urgent; `TASK-010` (changelog reconciliation) is
optional. If you're touching the background-art system or
`UI_SYSTEM.md`, note that file has a flagged, not-yet-done rewrite (see
its background-art section) — a good candidate task if the user wants
documentation debt paid down rather than new features.

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
Headline: `redact()` in `src/lib/game/state.ts` (the only thing preventing hidden
game information from leaking to clients), the Durable Object bindings/
migrations in `wrangler.jsonc`, and the WS protocol shapes in
`src/lib/game/types.ts` (a mismatch between the two deploy targets breaks live
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

1. Run `git status`, `git log --oneline -5`, `git branch -a`, and
   `git fetch origin` (read-only) and confirm the repo state matches
   what PROJECT_STATE.md describes — as of the 2026-08-17 checkpoint
   (post-merge), `main` is fully pushed to `origin/main` (0
   ahead/behind, HEAD `5be92bc`), `chore/polish` is merged in, and no
   other feature branch is unmerged. **Don't trust that this is still
   true — confirm it fresh, and re-check again right before you finish,
   not just at the start.** This repo's checkout is shared across
   concurrent Claude Code sessions/windows (proven directly: the
   2026-08-17 checkpoint watched the branch change from `chore/polish`
   to `main` mid-session, caused by a different session it had no
   visibility into) — git state here can change without any command you
   ran. This memory system has also now missed shipped commits for a
   full day+ **twice** (2026-08-06→07, and 2026-08-13→17) — assume
   drift by default and verify. If anything doesn't match what
   PROJECT_STATE.md says, stop and tell me what's different before
   proceeding.
2. Run the verification suite: `npm run typecheck && npm run
   typecheck:party && npm run lint && npm run build`. Confirm all four
   still pass (all four were clean as of 2026-08-07; not re-run
   2026-08-17 since no source file changed under this session — re-run
   fresh and don't assume, especially since a concurrent session's merge
   added new code since the last time this suite ran).
3. In 3-5 sentences, summarize your understanding of: what this
   project is, what the current task is (`TASK-010`, optional), and
   what it involves. I want to confirm you've actually absorbed the
   memory files, not just skimmed them.
4. Flag anything in CLAUDE.md/PROJECT_STATE.md/TASKS.md/FEATURES.md
   that looks stale or contradicts what you find in the actual code —
   don't silently work around a contradiction, surface it. Known
   pre-existing gaps as of this writing: (a) `UI_SYSTEM.md`'s
   background-art section describes the v1.10 SVG system, not the
   actual current PNG/10-style/upload system shipped in v1.14–v1.18 —
   flagged but not fully rewritten; (b) `src/lib/changelog.ts` (the
   in-app patch notes) stops at `"1.21"` and doesn't cover the 3
   commits from 2026-08-13–08-15 — see `TASK-010`; (c) the neon/glitch
   match-outcome effect's deployment was inferred from `vercel ls`, not
   independently confirmed by rendering it in a browser — worth a real
   check if you're touching `MatchEndView.tsx`.
5. Nothing needs to be asked before starting other work — `TASK-009` is
   resolved. `TASK-010` is optional; ask me if you want direction beyond
   it.
6. Preserve the existing architecture (Durable Objects via partyserver,
   the shared src/lib/game/ engine, the redact() information boundary)
   unless you find a genuinely strong reason to change it — and if you
   do, write it up in DECISIONS.md rather than changing it silently.
7. After completing any meaningful work — even a single small fix —
   update PROJECT_STATE.md, TASKS.md, and append to SESSION_LOG.md
   before ending your session. This exact omission has now happened
   twice (v1.13–v1.21, then the 3 commits 2026-08-13–08-15) — don't be
   the third. A one-line SESSION_LOG.md append is enough to prevent
   multi-version drift — it doesn't need to be exhaustive.
```
