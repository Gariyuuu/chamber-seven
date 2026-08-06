# Chamber Seven

A real-time online shotgun-duel game for 2–4 players: a shared shotgun is
loaded with a hidden, randomized sequence of live and blank shells, and each
turn you choose to fire on yourself or someone else while a pocket of
dirty-trick items shifts the odds. Original design inspired by the genre
popularized by *Buckshot Roulette*, with its own theme, rules, and a 23-item
set — including several items with no equivalent in the reference game
(Marked Bullet, Counterfeit Chip, Smoke Bomb, Second Wind, Silver Tongue,
Patch Kit, Overdose, and more). Unlike that game, each player's item hand is
private — opponents only see how many items you're holding, not what they
are, which is what makes the peek/discard/steal items meaningful.

**Live:** https://chamber-seven-omega.vercel.app

## Modes

- **Free-for-all** — 2–4 players, last one standing wins the round.
- **2v2 Duos** — 4 players, seats split into two teams, no friendly fire.
- **Boss Battle** — everyone vs. the last seat, who gets scaled-up HP and
  bonus item draws to stay dangerous solo.
- **Play vs AI** — fill any/all non-host seats with bots, any mode above.
- **Career Mode** — a 12-bot single-player ladder (`/career`), increasing
  in skill from "barely knows the rules" to "perfect." Beat the bot in
  front of you to unlock a bit more health and one more item, starting
  from a 3-item kit and ending with the full 23-item pool.

A cross-match leaderboard (`/leaderboard`) tracks human match wins by name.
5 selectable cosmetic table-vibe themes are available via the palette icon.

## Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui,
  deployed to Vercel.
- **Realtime backend**: a single authoritative [Cloudflare Worker](https://developers.cloudflare.com/workers/)
  (`party/game.ts`), built on [`partyserver`](https://github.com/threepointone/partyserver)
  (a Durable Object framework in the PartyKit lineage) and deployed with
  `wrangler`. One Durable Object instance per room holds the real game state
  — including the shell order and each player's hand — so neither client can
  ever see hidden information by reading browser state; everything is
  redacted per-recipient before being sent (`src/lib/game/state.ts#redact`).
  A second, single global Durable Object backs the leaderboard.
- **Client transport**: [`partysocket`](https://www.npmjs.com/package/partysocket)
  (works against both PartyKit and `partyserver` backends).
- Shared game rules/types live in `src/lib/game/` and are imported by both
  the Worker (`party/game.ts`) and the Next.js client — one source of truth
  for the state machine.

## Local development

Two processes, run together with:

```bash
npm run dev:all
```

- `npm run dev` — Next.js (binds to http://localhost:3000, or the next free
  port if something else on your machine already holds 3000 — check the
  terminal output)
- `npm run dev:party` — the game server via `wrangler dev` on http://localhost:8787

`.env.local` points the client at the local worker
(`NEXT_PUBLIC_PARTYKIT_HOST=127.0.0.1:8787` — see `.env.example`). Multiple
players can be tested on one machine using separate browser contexts (e.g. a
normal window + one or more private/incognito windows), since player
identity and reconnect tokens are stored in `localStorage` per room.

On a fresh clone, generate the Worker's runtime types first (gitignored,
required by `party/tsconfig.json`):

```bash
npx wrangler types
```

Typecheck the two TypeScript projects separately (the Worker has its own
`party/tsconfig.json` so Cloudflare Workers runtime types never leak into
the Next.js app's global scope, and vice versa):

```bash
npm run typecheck        # Next.js app
npm run typecheck:party   # Worker
npm run lint
npm run build
```

## Deployment

**Worker (game server):**

```bash
npx wrangler login   # one-time
npm run deploy:party  # wrangler deploy
```

Requires a Cloudflare account with a registered `workers.dev` subdomain
(one-time manual step in the Cloudflare dashboard the CLI can't complete:
Workers & Pages → Subdomain). This project's Worker is live at
`https://chamber-seven.chamber-seven.workers.dev`.

**Frontend:**

```bash
vercel deploy --prod
```

Set `NEXT_PUBLIC_PARTYKIT_HOST` in the Vercel project's environment
variables to the deployed Worker's host (no protocol prefix). New Vercel
projects on this account default to an SSO deployment-protection wall —
disable it after the first deploy so the public URL actually loads:
`vercel project protection <name> --format json` to check,
`vercel project protection disable <name> --sso` to fix.

## Game rules

- Each round starts with randomized HP within a configured range. The
  chamber reloads (a new random mix of live/blank shells, size varies)
  whenever it empties, mid-round.
- On your turn: use any number of items, then fire at yourself or another
  player (any non-eliminated player; in team modes, teammates can't be
  targeted).
  - Fire at yourself, blank → you go again.
  - Fire at yourself, live → you take damage, turn passes.
  - Fire at someone else → turn always passes, live shells deal damage.
- Free-for-all: last player standing wins the round; first to the
  configured round-win count takes the match. Team modes (2v2 Duos, Boss
  Battle) are single-round — last team standing wins.
- Items are dealt a few at a time at each reload, capped hand size. See
  `src/lib/game/items.ts` for the full list and descriptions.

## More detail

This repo maintains a full internal documentation/handoff system for
AI-assisted development — see `CLAUDE.md` for the operating manual, and
`ARCHITECTURE.md`, `FEATURES.md`, `API_REFERENCE.md`, `DATABASE.md`,
`SECURITY.md`, `TESTING.md`, and `DEPLOYMENT.md` for deep dives on each
area. `TASKS.md` tracks what's in progress or planned next.
