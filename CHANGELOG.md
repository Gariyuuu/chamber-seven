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
