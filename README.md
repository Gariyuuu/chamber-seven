# Chamber Seven

A two-player, real-time online shotgun-duel game: a shared shotgun is loaded
with a hidden, randomized sequence of live and blank shells, and each round
you choose to fire on yourself or your opponent while a pocket of dirty-trick
items shifts the odds. Original design inspired by the genre popularized by
*Buckshot Roulette*, with its own theme, rules, and an expanded item set —
including several items with no equivalent in the reference game (Marked
Bullet, Counterfeit Chip, Smoke Bomb, Second Wind, Silver Tongue). Unlike that
game, each player's item hand is private — your opponent only sees how many
items you're holding, not what they are, which is what makes the
peek/discard/steal items meaningful.

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

- `npm run dev` — Next.js on http://localhost:3000
- `npm run dev:party` — the game server via `wrangler dev` on http://localhost:8787

`.env.local` points the client at the local worker
(`NEXT_PUBLIC_PARTYKIT_HOST=127.0.0.1:8787`). Two players can be tested in
one machine using two separate browser contexts (e.g. a normal window +
a private/incognito window), since player identity and reconnect tokens are
stored in `localStorage` per room.

Typecheck the two TypeScript projects separately (the Worker has its own
`party/tsconfig.json` so Cloudflare Workers runtime types never leak into
the Next.js app's global scope, and vice versa):

```bash
npm run typecheck        # Next.js app
npm run typecheck:party   # Worker
npm run lint
```

## Deployment

**Worker (game server):**

```bash
npx wrangler login   # one-time
npm run deploy:party  # wrangler deploy
```

Requires a Cloudflare account with a registered `workers.dev` subdomain
(one-time manual step in the Cloudflare dashboard the CLI can't complete:
Workers & Pages → Subdomain).

**Frontend:**

```bash
vercel deploy --prod
```

Set `NEXT_PUBLIC_PARTYKIT_HOST` in the Vercel project's environment
variables to the deployed Worker's host (e.g.
`chamber-seven.<your-subdomain>.workers.dev`, no protocol prefix). New
Vercel projects on this account default to an SSO deployment-protection
wall — disable it after the first deploy so the public URL actually loads:
`vercel project protection <name> --format json` to check,
`vercel project protection disable <name> --sso` to fix.

## Game rules

- Each player starts a round with full HP. The chamber reloads (a new
  random mix of live/blank shells, size varies) whenever it empties, mid-round.
- On your turn: use any number of items, then fire at yourself or your
  opponent.
  - Fire at yourself, blank → you go again.
  - Fire at yourself, live → you take damage, turn passes.
  - Fire at your opponent → turn always passes, live shells deal damage.
- First to reduce the other player to 0 HP wins the round (unless saved by
  Second Wind). First to win 2 rounds wins the match.
- Items are dealt a couple at a time at each reload, capped hand size. See
  `src/lib/game/items.ts` for the full list and descriptions.
