# PROJECT_STATE.md — Exact Handoff Snapshot

**This file describes the state of the repository at one specific moment.**
It will go stale the instant more work happens — update it after every
meaningful session (see `CLAUDE.md` → Permanent rules).

## Status as of 2026-08-06 (latest of all): v1.11 SHIPPED — fixed v1.10's background contrast bug + mobile title overflow

Eighth pass this same day. User reported v1.10's new backgrounds made
text unreadable ("white background... insane contrast... keep most of
it dark") and that the font change didn't feel like it covered "all the
text." Reproduced with real WebKit screenshots at an iPhone 13 viewport
against **live production** (not assumed) and found two concrete bugs:
(1) the v1.10 background SVGs had a bright bulb glow + a lit-window grid
(with a flat white fallback for unlit ones) positioned dead-center where
every page's title sits, which `background-size: cover` blew up into
glaring blocks on mobile; (2) several hero headings had no responsive
downscaling — `page.tsx`'s title in particular got *bigger*, not
smaller, on wider screens, so it overflowed on phones with the new wider
`Butcherman` display face.

Fixed: regenerated all 5 background SVGs with every light source capped
much darker and moved away from the title-safe zone (top ~40% +
horizontal centerline now stay near-black everywhere); added
mobile-first responsive sizing to 6 affected headings; swapped the body
font again, `Barlow` → `Oswald` (more visually distinct from a default
sans, addressing "not just the main text"). New `v1.11` in-app changelog
entry. Full detail in `SESSION_LOG.md` (top entry).

Verified: `typecheck`×2/`lint`/`build` clean, plus real WebKit (mobile)
+ Chromium (desktop) screenshots across all 6 top-level pages and a live
vs-AI lobby/playing screen — confirmed both bugs are actually fixed
visually, not just "the font resolves correctly" (which v1.10 had
already verified and was still visually broken). **Committed, pushed to
`origin/main`, and deployed to both Cloudflare (`wrangler deploy`) and
Vercel (`vercel deploy --prod`)** — confirmed live via `curl` against
production.

## Status as of 2026-08-06 (prior pass): v1.10 SHIPPED (icon, player avatars, real fonts, new backgrounds, jump-scare)

Seventh pass this same day. User feedback, verbatim intent: add a site
icon, give human players the same animated character treatment the bot
dealer has, fix/replace the font ("I don't like the font"), replace the
repetitive moon-and-light-streaks background art, add more animation to
the "Table talk" event log, and add a full-screen jump-scare animation
on a live/damaging shot — plus patch notes. All six were implemented in
one pass, confirmed feasible up front via `AskUserQuestion` (font vibe:
grunge/horror display; art approach: hand-drawn SVG since no raster
image-generation tool is available in this environment — same technique
already used for `DealerAvatar.tsx`).

- **Site icon:** `src/app/icon.tsx` + `src/app/apple-icon.tsx` (Next.js
  file-convention dynamic icons via `next/og` `ImageResponse`) — a
  7-chamber revolver cylinder with one shell lit red. The old default
  `src/app/favicon.ico` (create-next-app placeholder, never customized)
  was deleted so these take over. Verified via a real build (`○ /icon`,
  `○ /apple-icon` routes generated) and a live browser check (`<link
  rel="icon" href="/icon?...">` present, correct PNG served).
- **Font bug fix + swap:** Found and fixed a real bug while investigating
  the "I don't like the font" complaint — `globals.css`'s `@theme inline`
  block had `--font-sans: var(--font-sans)`, a self-referential/circular
  CSS custom property. That's invalid, so the property fell back to the
  browser's default system font — **Geist was never actually rendering**
  on this site, despite being loaded and wired up via `next/font/google`.
  Fixed the circularity (`--font-sans: var(--font-body)`) and, per the
  user's chosen direction, swapped the actual typefaces: `Bebas_Neue` →
  `Butcherman` (`--font-display`, headlines/wordmark — a distressed
  horror-poster face) and `Geist` → `Barlow` (`--font-body`, everything
  else). `Geist_Mono` unchanged. Verified via computed-style check in a
  real browser (`getComputedStyle(h1).fontFamily` → `"Butcherman,
  \"Butcherman Fallback\""`, body → `"Barlow, \"Barlow Fallback\""`) —
  confirms the fix actually took effect, not just "it built."
- **Human player avatars:** New `src/components/game/PlayerAvatar.tsx` —
  a bare-headed, jacketed humanoid SVG figure (vs. `DealerAvatar`'s
  hooded specter), sharing the same idle-sway/firing-recoil animation
  system. The shared CSS classes were renamed from `dealer-avatar*` to
  `duel-avatar*` in `globals.css` (and `DealerAvatar.tsx` updated to
  match) so both avatars run off one animation implementation. Wired into
  `PlayerHud.tsx` (every human seat, including your own — previously
  human players had no avatar at all, just a name) and `Lobby.tsx`
  (roster list). Verified live: a real vs-AI match screenshot shows both
  "The Dealer" (hooded, blue glow) and "Tester (you)" (bare-headed, red
  glow) each with their own animated avatar.
- **New backgrounds:** All 5 `public/backgrounds/bg-<theme>.png` files
  (a glowing moon + vertical light-streaks over a skyline, template
  reused across all 5 themes just recolored — this exact repetition was
  the user's complaint) were **replaced**, not supplemented, with new
  hand-authored `bg-<theme>.svg` files: a rain-slicked brick alley, a
  glowing neon bar-sign, a fire escape, and an overhead bulb, generated
  programmatically (`/tmp` Python script, not committed) using each
  theme's actual `oklch()` primary/accent CSS variables so the art and
  the UI palette are exactly in sync. `globals.css`'s five `--bg-image`
  declarations were repointed `.png` → `.svg`. Verified via `qlmanage`
  thumbnail renders of each file plus a live browser screenshot.
- **Table talk animation:** `EventLog.tsx` — new lines now slide in
  (`table-talk-in` keyframe) instead of just fading, private reveals get
  a slightly different entrance (`table-talk-in-private`), and the `›`
  bullet has its own micro-entrance. Only genuinely new log lines
  animate (keyed by stable `entry.id`, so already-rendered lines don't
  replay on every re-render).
- **Jump-scare overlay:** New `src/components/game/ShootScare.tsx` — a
  full-screen overlay (a scaled-up version of the avatar art) that pops
  up with a flash and a screen-shake on any LIVE (damaging) shot that
  involves the local player: firing at someone shows the gun recoiling
  aside ("shooter", caption "BANG!"); getting hit — by your own hand
  (caption "SELF-INFLICTED") or someone else's ("YOU'VE BEEN HIT") —
  swings the gun to point straight at the viewer. Deliberately does
  **not** fire for shots that don't involve you (e.g. two bots dueling
  in a 3-4 player game), to avoid spamming the screen. Detected via a
  `useShootScare` hook in `PlayingView.tsx` that diffs `state.log` for a
  fresh `": LIVE."`-suffixed entry, same pattern as the existing
  `useDealerFx` hook. Verified live: a real vs-AI match, screenshotted
  mid-animation, shows the correct hooded figure, red flash, muzzle
  burst, and "SELF-INFLICTED" caption on a self-inflicted live shot.
- **Patch notes:** `src/lib/changelog.ts` — new `v1.10` entry covering
  all of the above, written for players (not engineers).

Verified: `npm run typecheck`, `npm run typecheck:party`, `npm run lint`,
`npm run build` all clean. Additionally ran a real `next dev` + `wrangler
dev` pair and drove it with Playwright (installed ad hoc into `/tmp`,
not added to the repo) to actually play a vs-AI match in a headless
Chromium browser — confirmed fonts, icon, avatars, background, table-talk
animation, and the jump-scare all render correctly at runtime, not just
"it compiles." **Not committed, not pushed, not deployed** — this pass
ends with a clean implementation, verified in a local dev environment
only; ask the user before committing/deploying since that wasn't part of
this specific request.

## Status as of 2026-08-06 (prior pass): v1.9 SHIPPED (tutorial + lessons)

Sixth pass this same day. The user asked for a tutorial covering all the
items, plus a lesson/strategy page. Built and shipped both:

- **`/tutorial`** — full rules, every game mode, and a complete glossary
  of all 23 items grouped by category (offense/defense/info/utility).
  Generated from the existing `ALL_ITEM_IDS`/`ITEM_INFO`/`ITEM_ICONS`/
  `ITEM_CATEGORY` data (same source of truth `ItemCard.tsx` uses) —
  never hand-duplicated, so a future new item appears here automatically.
- **`/lessons`** — 9 strategy lessons, each tied to a real, verifiable
  mechanic (odds math from the chamber panel, why shooting yourself on
  a likely-blank is correct, item sequencing around Loupe peeks,
  mode-specific plays for 2v2 Duos/Boss Battle/Career Mode) — not
  generic filler.
- Both linked from the landing page footer and the in-game header.
- Changelog bumped to `v1.9`, which also retroactively documents the
  prior session's Career Mode venue-backdrop fix (that session shipped
  the fix but never added a changelog line for it).

Verified: `typecheck` × 2, `lint`, `build` all clean; screenshot-checked
locally (all 23 items rendered correctly across all 4 categories) and
against **production** after deploying. Committed as `ae1219c` (feature)
— no backend/`party/`/`state.ts` changes were needed, so only the
frontend (`vercel deploy --prod`) was redeployed, not the Worker.

**No task remains queued.** `TASKS.md` → "Current task" still says "None."

## Status as of 2026-08-06 (prior pass): CHECKPOINT RE-CONFIRMED, ONE NEW FINDING

A fifth pass this same day — a pure "final account-switch checkpoint" with
no new product work requested. Re-ran `git status`/`git log`/`git diff
--stat` and `git fetch origin` (read-only) fresh rather than trusting the
section below. Result: **working tree clean, nothing uncommitted or
untracked.** Local `main` is at `1cb6c76` ("Sync memory system: backlog
cleared (TASK-004 through TASK-008)") — one commit newer than the
`ea9728b` TASK-008 commit referenced in the "BACKLOG CLEARED" section
below, because that section's own doc-sync commit landed after it was
written.

**New finding this pass — needs the user's attention:** `git fetch origin`
confirms local `main` is **9 commits ahead of `origin/main`**, which is
still sitting at `3a26ab9` (the pre-team-mode v1.7 commit). In other
words, **none of this same-day session's work — v1.8 team modes, the
post-v1.8 backlog cleanup, or the entire 17-file documentation system
itself — has been pushed to GitHub.** It is deployed and live on Vercel/
Cloudflare (deployed straight from the local working tree via the CLI,
which doesn't require a GitHub push), and it is safely committed locally,
but GitHub (`https://github.com/Gariyuuu/chamber-seven`) does not yet
reflect any of it. This wasn't previously called out anywhere in this
memory system. No `git push` was run during this checkpoint (out of scope
for a docs-only pass, and potentially the user's call to make, e.g. if
commits should be squashed/reordered first) — **flagging for the user to
decide whether/when to push.**

No other drift was found: `TASKS.md`'s "Current task: None" still holds,
no code files changed, `npm run typecheck` / `typecheck:party` / `lint`
were re-run fresh this pass and are still clean.

## Status as of 2026-08-06 (prior pass): BACKLOG CLEARED

Fourth pass this same day. The user asked to clear the entire remaining
backlog (`TASK-004` through `TASK-008`) without checking in until every
task was done. All five are complete, committed (5 separate commits:
`51afb5e`, `6d55991`, `71c3956`, `83c6c3f`, `ea9728b`), deployed to both
targets, and verified live in production via screenshots:

1. **TASK-004** — Career Mode's venue backdrops (`public/venues/tier1-6.png`)
   and `victory-burst.png`, previously dead/unreferenced assets despite
   the v1.7 changelog claiming they shipped, are now wired up: the
   Career hub's hero banner layers in the tier-appropriate venue image
   (escalating with the next opponent's tier), and the match-end
   level-up panel gets a soft `victory-burst.png` glow.
2. **TASK-005** — `useGameRoom.ts`'s dev-host fallback now matches
   `leaderboardApi.ts`'s (`127.0.0.1:8787`).
3. **TASK-006** — `zustand` removed from `package.json` (re-confirmed
   unused via a fresh grep first) and `package-lock.json` regenerated.
   Running `npm install` for this surfaced 3 pre-existing `npm audit`
   findings (moderate/high, in `undici` via `wrangler`'s bundled
   `miniflare`, dev-only tooling) — **not fixed**, since the available
   automatic fix would force-downgrade `wrangler` by ~80 versions, a
   disproportionately risky change for an unrelated task. Recorded in
   `SECURITY.md`/`TASKS.md` as a deliberate non-action, not an oversight.
4. **TASK-007** — Team assignments (and the boss) now preview in the
   pre-game lobby, via a new pure `teamForSeatIndex()` helper in
   `state.ts` shared by both the real `assignTeams()` and the lobby's
   preview — so the preview can never drift from the real rule.
5. **TASK-008** — `README.md` rewritten to describe the actual current
   feature set instead of the original 2-player-only description.

All four verification commands (`typecheck` × 2, `lint`, `build`) passed
clean before committing. Screenshots confirmed all the visual changes
render correctly, both locally and — for the career hero and lobby
preview — against the live production URL.

**No task remains queued.** See `TASKS.md` → "Current task" (says
"None") and `HANDOFF.md`.

## Status as of 2026-08-06 (prior pass): SHIPPED (v1.8)

The v1.8 team-mode feature (2v2 Duos, Boss Battle) — the subject of
almost everything else in this file below — **is done.** Third pass this
same day, following the user's instruction to "continue building the
game from where it left off in the memory":

1. Resolved `TASK-002` (see the dedicated section further down) via a
   screenshot-based check that sidestepped the earlier ambiguous
   Playwright text-matching evidence entirely — confirmed the feature
   genuinely works correctly in both modes.
2. Committed as two commits: `47c651e` (the documentation/memory system)
   and `2a9c951` (the team-mode feature itself).
3. Deployed the Worker: `npx wrangler deploy` succeeded. This also
   confirmed, for the first time, the exact production Worker URL:
   **`https://chamber-seven.chamber-seven.workers.dev`** (previously
   marked unverified in `DEPLOYMENT.md` — now fixed there too).
4. Deployed the frontend: `npx vercel deploy --prod` succeeded, aliased
   to `https://chamber-seven-omega.vercel.app`.
5. Verified in production: confirmed the `v1.8` changelog entry text is
   live via `curl`, and ran a screenshot-based check of a real Boss
   Battle match **against the live production URL** — confirmed the
   crown, exact 3× HP scaling (15/15 vs 5/5), exact +2 bonus items (5 vs
   3), correct team badges, and correct teammate-exclusion in the
   target picker, all on the actual deployed Worker + frontend talking
   to each other for real.

**Everything below this point describes the investigation and audit
that led up to this — kept for institutional memory, but the working
tree is no longer dirty with unshipped team-mode code as of this
status.** Current `git status`/`git log` should be re-checked fresh
rather than trusted from memory (see `CLAUDE.md`'s standing rule on
this) — as of writing this update, only this round of post-deploy
documentation edits remains uncommitted.

## Audit timestamp (historical — see "Status" above for the current
state)

- **Audit performed:** 2026-08-06 (documentation/handoff audit — no
  product code was intentionally changed during this audit, only
  documentation files were added/updated)
- **Wall-clock time at audit:** 2026-08-06T09:57 UTC (approx.)
- **Checkpoint re-confirmed:** 2026-08-06, same day, a second pass (a
  user-requested "final account-switch checkpoint"). **Nothing in the
  repository changed between the initial audit and this checkpoint** —
  no new commits, no further edits to any product/game source file. This
  checkpoint re-verified the git state and tightened the documentation
  (see `SESSION_LOG.md`'s second entry for exactly what changed in the
  docs themselves). One real fix was made during this checkpoint: `.env.example`
  was discovered to be silently caught by `.gitignore`'s `.env*` pattern
  (meaning it would never actually be committed, defeating its purpose)
  — a `!.env.example` negation line was added to `.gitignore` to fix
  this. This is the **only** file outside the pure-documentation set
  touched during either pass.

## Git state (historical — describes the state at the very first audit,
before v1.8 was even committed; see "Status as of 2026-08-06 (latest of
all)" at the top of this file for the current, re-confirmed git state,
including the now-documented fact that `main` is ahead of `origin/main`)

- **Branch:** `main`
- **Tracking:** `origin/main` (`https://github.com/Gariyuuu/chamber-seven.git`),
  up to date with remote as of the last fetch this session (**stale
  claim — no longer true; re-confirmed via a fresh `git fetch origin` at
  the latest checkpoint that `main` is 9 commits ahead of `origin/main`,
  see top of file**)
- **Latest commit:** `3a26ab990f79be85e9ad539a236b395286543e12` —
  "Career Mode: a chess.com-style bot ladder, and 20 more illustrated
  images" (2026-08-05T21:05:48-07:00)
- **Working tree:** **Dirty.** Re-confirmed via `git status --porcelain`
  at the checkpoint. Modified, not staged, not committed:
  - `.gitignore` (the `.env.example` fix above)
  - `CLAUDE.md` (rewritten from a placeholder into a full operating
    manual)
  - `src/components/game/GameSettingsForm.tsx`
  - `src/components/game/MatchEndView.tsx`
  - `src/components/game/PlayerHud.tsx`
  - `src/components/game/TargetSelector.tsx`
  - `src/lib/career.ts`
  - `src/lib/changelog.ts`
  - `src/lib/game/state.ts`
  - `src/lib/game/types.ts`
- **Untracked files:** exactly the new memory system files —
  `.env.example`, `API_REFERENCE.md`, `ARCHITECTURE.md`, `CHANGELOG.md`,
  `DATABASE.md`, `DECISIONS.md`, `DEPLOYMENT.md`, `FEATURES.md`,
  `FILE_MAP.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `ROADMAP.md`,
  `SECURITY.md`, `SESSION_LOG.md`, `TASKS.md`, `TESTING.md`,
  `UI_SYSTEM.md`. (17 untracked files total, re-counted and confirmed
  against `git status --porcelain` at this checkpoint.)
- **No branches other than `main` exist locally or on the remote** (per
  `git branch -a`). No tags exist. Branch `main` is up to date with
  `origin/main` (re-confirmed).

## Active development objective (before this audit interrupted it)

Implement two new game modes on top of the existing 2–4 player
free-for-all engine:

- **2v2 Duos** — locks to exactly 4 players, seats `p1`+`p3` vs.
  `p2`+`p4`, single round, no friendly fire.
- **Boss Battle** — everyone vs. the last active seat, who gets HP scaled
  up (`hp × max(1, otherPlayerCount)`) and draws 2 bonus items every
  reload, single round.

This was scoped as changelog entry **v1.8** (already drafted in
`src/lib/changelog.ts`, uncommitted).

## What has already been completed (this feature, uncommitted)

All of the following exist in the working tree right now and pass static
verification (see below):

1. **Data model** — `TeamMode = "none" | "duos" | "boss"` added to
   `src/lib/game/types.ts`, plus `team: 0 | 1 | null` on `PlayerState`
   and `RedactedPlayer`, plus `teamMode` on `GameSettings`.
2. **Engine** (`src/lib/game/state.ts`) — `assignTeams()`,
   `bossSeatOf()`, `isTeammate()`, a team-aware `roundOver()` replacing
   the old "only one seat left" check, boss HP scaling and bonus draws in
   `beginRound()`/`reload()`, friendly-fire blocks in `fire()` and
   `applyItemEffect()`'s `requireTarget()`, Molotov excluding teammates,
   and `clampSettings()` enforcing "duos requires exactly 4 players" +
   "any team mode forces `roundsToWin = 1`".
3. **Bot AI** — `runBotStep()`'s target selection excludes teammates.
4. **Settings UI** — `GameSettingsForm.tsx` has a Team Mode selector
   (Free-for-all / 2v2 Duos / Boss Battle) with the player-count and
   match-length fields kept in sync with the invariants above.
5. **Client UI** — `PlayerHud.tsx` shows a Team A/Team B badge and a
   crown icon for the boss; `TargetSelector.tsx` excludes teammates from
   the pickable list and shows a crown for the boss;
   `MatchEndView.tsx` computes "did you win" correctly for team modes
   (comparing team membership, not just literal winner seat) and shows
   team-aware outcome text and a team-grouped standings list.
6. **`career.ts`** — fixed to supply the new required `teamMode: "none"`
   field in `careerMatchSettings()` (career matches are never team
   matches).
7. **Changelog** — a `v1.8` entry drafted in `src/lib/changelog.ts`
   describing the above in player-facing language.

## TASK-002 resolution (2026-08-06, follow-up session)

**RESOLVED — the team-mode feature works correctly.** A screenshot-based
verification (bypassing all DOM-text-query timing issues entirely by
literally rendering the page and viewing the image) was performed for
both modes:

- **2v2 Duos:** "Tester (you)" and "The Croupier" both correctly show
  **TEAM A**; "The Dealer" and "The Shark" both correctly show
  **TEAM B** (p1+p3 vs p2+p4, exactly as designed). The target picker
  correctly offers only "Yourself," "The Dealer," and "The Shark" —
  **"The Croupier" (a teammate) is correctly excluded.**
- **Boss Battle:** "The Shark" correctly shows a crown icon and **TEAM
  B**, with **30/30 HP** (exactly 3× the 10 HP everyone else has —
  matches `bossHpMultiplier = max(1, otherPlayerCount) = 3`) and **5
  items** (exactly `itemsPerReload(3) + BOSS_BONUS_DRAWS(2)`). Everyone
  else correctly shows **TEAM A**. The target picker correctly offers
  only "Yourself" and "The Shark."
- Both were re-confirmed correct **many turns into actual play**, not
  just at match start — team labels, HP, and the crown all persisted
  correctly deep into extended matches.
- **Root cause of the earlier contradictory evidence:** two separate
  false leads were identified and debunked by direct code inspection —
  (1) the "2 elements matched 'Single round' text" oddity was not a
  double-mounted-dialog bug; it's simply that `GameSettingsForm.tsx`'s
  "2v2 Duos"/"Boss Battle" hint text *itself* contains the substring
  "single round" (e.g. "Requires 4 players, single round."), separate
  from the Match Length section's own "Single round — team modes decide
  it in one go." hint — Playwright's case-insensitive `hasText`
  matching found both, which is correct behavior, not a bug. (2) The
  original "Has Team A: false" / "Has Team B: false" results from the
  prior session's text-matching Playwright scripts are now understood
  to have been artifacts of that specific automation approach (likely
  timing-related), not a real rendering defect — screenshots taken with
  a more generous settle delay show the badges rendering correctly and
  consistently.
- **Not independently re-confirmed by this pass:** the exact
  `MatchEndView.tsx` win/loss framing screen itself (neither scripted
  match reached full completion within a reasonable turn budget — bot
  turn delays plus large item hands make forced-AI playouts slow). This
  code was manually reviewed line-by-line in the original audit and
  found correct (simple team-membership comparison, no new risk
  surface); given every harder, more bug-prone rendering path is now
  confirmed working, this residual gap is treated as low-risk and not
  blocking deployment.

## What has NOT been completed / verified (historical — see resolution above)

1. **Runtime verification is inconclusive.** During this session, a
   hand-written (uncommitted, scratch-directory) Playwright script was
   used to drive the real dev UI (`next dev` + `wrangler dev`) through a
   full 2v2 Duos match and a full Boss Battle match. Results were
   **contradictory across repeated runs**:
   - One direct DOM inspection (dumping the actual rendered
     `felt-panel` HTML mid-match) showed team badges rendering correctly
     ("Team B" on one bot, "Team A" on another).
   - Multiple full end-to-end script runs, checking `document.body`'s
     rendered text for the substrings "Team A" / "Team B" shortly after
     the game entered the "playing" phase, reported **both badges
     absent**, even after adding explicit settle-delays.
   - The contradiction was **not root-caused** before this documentation
     task interrupted the work. Leading hypotheses (none confirmed):
     a Playwright/browser-automation timing race specific to the ad hoc
     test script, vs. a genuine intermittent client-side rendering bug.
     Every relevant server-side function (`assignTeams`, `bossSeatOf`,
     `redact`) was manually re-read line-by-line and appears logically
     correct; no bug was found by code review alone.
   - **One unexplained data point worth carrying forward:** a diagnostic
     script queried `page.locator("p", { hasText: "Single round" })`
     (the Match-length section's team-mode hint text in
     `GameSettingsForm.tsx`) and got a count of **2**, even though a
     simultaneous check of `page.locator("[role=dialog]")` reported only
     **1** open dialog. This was never explained. It's *possible* this
     is nothing (a Playwright `hasText` quirk matching an element via
     two different internal paths) — but it's also possible it's a real
     clue that something about the settings form renders twice in some
     state (e.g. the landing page's `hostOpen` and `aiOpen` dialogs both
     mount a `GameSettingsForm` instance even when only one is visually
     open), which — if true — could plausibly explain *why* a scripted
     click sequence might occasionally interact with the wrong form
     instance and end up sending different settings than what was
     visually selected. **Whoever picks up TASK-002 should check this
     specifically** (e.g. `document.querySelectorAll` for how many
     `GameSettingsForm`-rendered sections exist in the DOM at once when
     a settings dialog is open) before assuming it's irrelevant.
   - **Practical implication: do not assume the team-mode UI reliably
     works. Verify fresh before deploying** — see `TASKS.md` `TASK-002`.
2. **Not deployed anywhere.** Neither the Cloudflare Worker
   (`npx wrangler deploy`) nor the Vercel frontend
   (`vercel deploy --prod`) has been run with these changes. Production
   is still running the previous commit (`3a26ab9`, v1.7 Career Mode).
   Confirmed via `npx vercel ls chamber-seven` (latest production deploy
   ~6h before this audit, i.e. before this session's work began) and
   `npx wrangler deployments list` (latest Worker deployment
   `2026-08-06T04:01:44Z`, also before this session's uncommitted work).
3. **Not committed.** No `git commit` has been made for any of the
   team-mode work.

## What currently works (verified this audit)

- `npm run typecheck` — **passes**, clean, on the current dirty working
  tree (includes the uncommitted team-mode changes).
- `npm run typecheck:party` — **passes**, clean.
- `npm run lint` — **passes**, clean, zero warnings/errors.
- `npm run build` (`next build`) — **passes**, production build
  completes successfully, all 5 static routes + 1 dynamic route
  (`/room/[roomId]`) build without error.
- `npx wrangler deploy --dry-run` — **passes** (bundle builds, ~72KiB /
  18.6KiB gzip, both Durable Object bindings resolve); confirmed this
  does **not** publish anything (verified no new Worker deployment
  appeared in `wrangler deployments list` immediately after running it).
- The **previously-deployed** v1.7 build (Career Mode) is confirmed live
  at `https://chamber-seven-omega.vercel.app` via `npx vercel inspect`.

## What currently fails / is unverified

- Whether the team-mode UI (badges, crown, targeting restrictions,
  match-end messaging) actually renders and behaves correctly for a real
  player in a real browser — **unverified**, see above.
- No automated tests exist to catch a regression here even if fixed —
  see `TESTING.md`.

## Errors observed this session (all resolved except the one above)

- `career.ts` initially failed `npm run typecheck` with `TS2741:
  Property 'teamMode' is missing` — fixed by adding
  `teamMode: "none"` to `careerMatchSettings()`'s return object. Resolved,
  confirmed by clean typecheck.
- Several background dev-server processes (`npm run dev:all`) were
  killed unexpectedly mid-test during this session's local verification
  work (observed exit codes 0/143/SIGTERM from processes that should
  have kept running). Root cause not conclusively identified — suspected
  interaction between how backgrounded shell jobs were supervised across
  tool calls in the agent harness, not a bug in the app itself. Workaround
  used: run the dev servers and the test script inside a single
  self-contained background shell script (start servers, poll until
  ready via `curl`, then run the test, all in one process) rather than
  as two separately-backgrounded commands. This workaround succeeded in
  keeping the servers alive for a full test run, but did not resolve the
  Team A/B badge contradiction described above.
- A port collision was observed: another, unrelated project in
  `~/Projects` (`buildstrike-arena`) was independently running `next dev`
  and had already claimed `localhost:3000` on this machine during part of
  this session, causing `chamber-seven`'s own `next dev` to silently fall
  back to `3001` (or `3900` when explicitly pinned). If a future session
  hardcodes `localhost:3000` in a test script without checking which app
  is actually listening there, it will silently test the wrong
  application. **Recommendation:** always pin an explicit port for
  `next dev -p <port>` in throwaway test scripts, and confirm via the
  dev server's own startup log which port it actually bound.

## Assumptions currently in effect (not independently re-verified this
audit beyond what's stated above)

- The exact Cloudflare Worker `*.workers.dev` subdomain is assumed to
  match whatever is currently set for `NEXT_PUBLIC_PARTYKIT_HOST` on the
  live Vercel project — this was **not** independently checked via the
  Vercel dashboard/CLI env-var listing during this audit (out of scope
  for a documentation-only pass that avoids touching deployment state).
- The Cloudflare account/zone referenced by `wrangler deploy` is assumed
  to be already correctly authenticated in this environment (a prior
  session's memory notes `npx wrangler login` as a one-time step already
  done) — not re-verified this audit.

## Next three recommended actions (historical — all three below were
completed; see "Status as of 2026-08-06 (latest): SHIPPED" at the top
of this file)

1. ~~Root-cause the team-badge rendering contradiction (`TASK-002`).~~
   **Done** — screenshot-based check, confirmed working.
2. ~~Commit, deploy Worker, deploy frontend, re-verify against
   production.~~ **Done** — see "Status" section at the top for the
   full record (commit hashes, deploy confirmations, production
   screenshot).
3. (The "if broken, fix and retry" contingency did not apply — the
   feature worked as designed.)

**For whoever reads this next:** don't re-do the above. If you're
looking for the next thing to work on, check `TASKS.md` → "Current
task" (as of this writing, nothing is in progress — the backlog's next
suggested item is `TASK-004`, but confirm with the user before starting
it).

## Verification performed before shipping (historical record)

Before deploying: a screenshot-based (not just automated-DOM-text-query)
pass through both new modes confirmed (a) team badges appear on the
correct players, (b) the boss gets the crown icon and visibly more HP
(exactly 3×) and more items (exactly +2), (c) the teammate-exclusion
target-picker behavior is correct. (d) The match-end screen's win/loser
framing specifically was not captured by screenshot (matches didn't
finish within the scripted turn budget) but was manually code-reviewed
and judged low-risk given everything harder was confirmed working — see
the "TASK-002 resolution" section above for the full reasoning. After
deploying, the same Boss Battle check was re-run **directly against the
production URL** and produced the same correct result.
