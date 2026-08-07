# CHANGELOG.md — Repository / Engineering Changelog

**This file tracks repository-level and documentation-level history.**
The player-facing, in-app patch notes (what actually shows on the
`/changelog` page) live separately in `src/lib/changelog.ts` — see that
file for the full v1.0–v1.7 feature history (game features, not
documentation).

This file did not exist before this audit. It is being introduced now to
track engineering/documentation milestones going forward, per the
handoff memory system described in `CLAUDE.md`.

---

## 2026-08-06 — v1.12: removed the background glow entirely

**Type:** Bug fix / follow-up to v1.11, same day. User: "still has white
background get rid of that bright glow, its still light." Rather than
tune the glow's opacity a third time, removed the soft radial
"halo" light-source elements from all 5 background SVGs entirely — flat
dark brick/floor + rain + faint outlines now, no blooms anywhere.
Defensively also swapped `oklch()`/`color-mix()` for plain hex colors in
those SVGs (unconfirmed as the actual cause, but removes the risk
class). See `SESSION_LOG.md` top entry — includes a note for future
sessions not to re-introduce a dimmed glow here.

Verified via real WebKit screenshots (iPhone 13, full page) against live
production after deploying. Committed, pushed, deployed to both
Cloudflare and Vercel.

---

## 2026-08-06 — v1.11: fixed v1.10's background contrast bug + mobile title overflow

**Type:** Bug fix, in direct response to user feedback on v1.10 (deployed
same day). Two real bugs, not taste: (1) the new background SVGs had a
bright bulb-glow + lit-window grid positioned where every page's title
sits, which mobile's `background-size: cover` crop blew up into glaring
blocks — reported as "white background, can't see the text"; (2) several
hero headings had no/inverted responsive sizing and overflowed on phones
once the display face switched to the wider `Butcherman`. Fixed both,
plus swapped the body font again (`Barlow` → `Oswald`) since the user
felt the font change didn't read as covering "all the text." See
`SESSION_LOG.md` top entry for full root-cause detail and
`src/lib/changelog.ts` `v1.11` for the player-facing version.

Verified via real WebKit (iPhone 13 viewport) + Chromium screenshots
across all 6 top-level pages — deliberately not just a computed-style
check, since that's exactly what let the v1.10 bug ship unnoticed.
Committed, pushed, and deployed to both Cloudflare and Vercel; confirmed
live via `curl`.

---

## 2026-08-06 — v1.10: icon, human player avatars, real fonts, new backgrounds, jump-scare

**Type:** Product/UI feature work, plus one real bug fix. See
`src/lib/changelog.ts` `v1.10` for the player-facing version and
`SESSION_LOG.md` (top entry) for the full engineering detail.

Six user-requested changes shipped in one pass: a generated site icon
(`src/app/icon.tsx`/`apple-icon.tsx`), an animated avatar for human
players (`PlayerAvatar.tsx`, previously only bots had one), a font swap
(`Butcherman`/`Barlow`) that also fixed a genuine bug — `globals.css` had
`--font-sans: var(--font-sans)`, a circular CSS custom property, so the
site had silently never been rendering `Geist` at all — five new
hand-drawn SVG theme backgrounds replacing the old PNGs (which shared one
moon-and-light-streaks template just recolored), an entrance animation
for the "Table talk" event log, and a full-screen jump-scare overlay
(`ShootScare.tsx`) on live/damaging shots involving the local player.

No raster image-generation tool is available in this environment; the
new backgrounds and jump-scare art are hand-authored SVG, generated via
a throwaway (not committed) Python script for the backgrounds, matching
the existing `DealerAvatar.tsx` inline-SVG convention.

Verified via `npm run typecheck`/`typecheck:party`/`lint`/`build` (all
clean) plus a real headless-browser run (Playwright, installed ad hoc,
not added to the repo) against a live `next dev` + `wrangler dev` pair —
confirmed fonts/icon/avatars/backgrounds/animations/jump-scare all
actually render correctly, not just "it compiles." **Not committed,
pushed, or deployed** as part of this pass.

---

## 2026-08-06 — Documentation & handoff audit

**Type:** Documentation only. No product/game behavior was intentionally
changed.

A full repository audit was performed to build a permanent, in-repo
memory system so that a new AI coding session (or new developer) can
resume work with minimal rediscovery. This was done by reading the
actual source code, configuration, and git history — not by relying on
prior chat/session history.

**Files created:**
- `CLAUDE.md` (rewritten from a placeholder `@AGENTS.md` include into a
  full operating manual)
- `PROJECT_STATE.md`
- `ARCHITECTURE.md`
- `FILE_MAP.md`
- `FEATURES.md`
- `TASKS.md`
- `ROADMAP.md`
- `DECISIONS.md`
- `DATABASE.md`
- `API_REFERENCE.md`
- `UI_SYSTEM.md`
- `SECURITY.md`
- `TESTING.md`
- `DEPLOYMENT.md`
- `CHANGELOG.md` (this file)
- `SESSION_LOG.md`
- `HANDOFF.md`
- `.env.example`

**Significant problems discovered during the audit** (see the relevant
file for full detail on each):
- `public/venues/tier1.png`–`tier6.png` and `public/victory-burst.png`
  are unreferenced by any source file, despite the v1.7 in-app changelog
  entry claiming "6 mood-lit venue backdrops" ship as part of Career
  Mode. See `FEATURES.md` → Career Mode and `TASKS.md` `TASK-004`.
- The in-progress, uncommitted 2v2 Duos / Boss Battle team-mode feature
  (intended as v1.8) is code-complete and passes all static checks, but
  its runtime behavior could not be conclusively verified this session —
  see `PROJECT_STATE.md` for the full, contradictory test evidence.
- `zustand` is an installed but entirely unused dependency.
- `useGameRoom.ts` and `leaderboardApi.ts` have inconsistent local-dev
  WebSocket host fallbacks (`127.0.0.1:1999` vs `127.0.0.1:8787`).
- `README.md` is stale (describes the game as strictly two-player,
  pre-dating the 2–4 player FFA, Career Mode, and team-mode work).
- `worker-configuration.d.ts` is required by `party/tsconfig.json` but
  is gitignored/untracked — a fresh clone needs to run
  `npx wrangler types` before `npm run typecheck:party` will succeed,
  and this wasn't documented anywhere before now.

**No product behavior was intentionally changed** during this audit.
`npm run typecheck`, `npm run typecheck:party`, `npm run lint`, and
`npm run build` were all run as read-only verification (no `--fix`
flags, no code edits made outside the new documentation files
themselves) and all passed cleanly both before and after the
documentation was added.

---

## Prior history (reconstructed from `git log` and `src/lib/changelog.ts`)

The following mirrors the in-app changelog (`src/lib/changelog.ts`) for
convenience — see that file for full player-facing detail on each
release, and `git log --oneline` for the exact matching commits.

| Version | Commit | Summary |
|---|---|---|
| v1.7 | `3a26ab9` | Career Mode: 12-bot ladder, 20 illustrated images |
| v1.6 | `25e8f3a` | Real illustrated backgrounds, bolder item colors, animated dealer avatar |
| v1.5 | `9951a94` | Neon Tokyo theme picker, healing items, item-pool settings, leaderboard |
| v1.4 | `90fbcc0` | Fixed theme color bug, added patch notes page |
| v1.3 | `7201ae5` | Balance pass: capped Irons/Vulture's Due, rarer cuffs, added Magnum Load |
| v1.2 | `0fbcd65` | Decorative visual pass: felt table panel, poker-chip code, flourishes |
| v1.1 | `660332a` | Expanded to N-player FFA (4 players), settings menu, 10 new items |
| v1.0 | `07df480`, `e0d401b` | Initial build + vs-AI mode |

**Not yet released:** v1.8 (2v2 Duos, Boss Battle) — see `PROJECT_STATE.md`.
