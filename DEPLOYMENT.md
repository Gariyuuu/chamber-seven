# DEPLOYMENT.md

Two independent deploy targets, no CI/CD automation tying them together
(no `.github/workflows/` directory exists in this repo — verified).
Whoever deploys is responsible for remembering to deploy **both** when a
change touches `src/lib/game/**` (shared by both).

## Hosting providers

- **Frontend:** Vercel. Project name `chamber-seven`, org/team
  `garywangsmes-8349s-projects` (per `.vercel/project.json`:
  `projectId: prj_q6LG8mwDE7sS702uL1OVUdaEt2dh`,
  `orgId: team_gofGt63nGGecSpDl9hBbsFWm`).
- **Backend:** Cloudflare Workers, via `wrangler` (config in
  `wrangler.jsonc`). Worker name `chamber-seven`. Two Durable Object
  classes bound: `Main`, `Leaderboard`.

## Production URLs

- **Frontend (confirmed live as of this audit):**
  `https://chamber-seven-omega.vercel.app` (a stable alias; the
  underlying per-deploy URLs like
  `chamber-seven-nahriuyx7-garywangsmes-8349s-projects.vercel.app`
  rotate on every deploy — always use the stable alias when linking or
  testing).
  - Other equivalent aliases observed:
    `chamber-seven-garywangsmes-8349s-projects.vercel.app`,
    `chamber-seven-git-main-garywangsmes-8349s-projects.vercel.app`.
- **Backend:** `chamber-seven.<account-subdomain>.workers.dev` — the
  exact `<account-subdomain>` is **not stored in this repository** (it's
  a Cloudflare account-level setting configured once outside of any
  file here). To find it: check the `NEXT_PUBLIC_PARTYKIT_HOST`
  environment variable currently set on the live Vercel project (Vercel
  dashboard → chamber-seven project → Settings → Environment Variables),
  or run `npx wrangler deployments list` / check the Cloudflare
  dashboard directly.

## Build command / output

- **Frontend:** `next build` (`npm run build`). Standard Next.js App
  Router output — Vercel's Next.js framework preset handles this
  automatically; **no `vercel.json` exists in this repo**, so all build/
  output/routing configuration is Vercel's Next.js auto-detection
  defaults, not a custom override.
- **Backend:** `wrangler deploy` bundles `party/game.ts` (entry point per
  `wrangler.jsonc`'s `"main"`) and everything it imports (including
  `src/lib/game/**`) into a single Worker script. Confirmed via
  `npx wrangler deploy --dry-run`: ~72KiB unminified / ~18.6KiB gzipped
  as of this audit's working tree (including the uncommitted team-mode
  code).

## Installation command

`npm install` — standard, no special flags, `package-lock.json` is
committed (npm, not pnpm/yarn — no other lockfile exists in the repo).

## Runtime version

- **Node.js:** not pinned anywhere in the repo (no `.nvmrc`, no
  `engines` field in `package.json`). Vercel will use its own default
  Node version for the Next.js build; locally, whatever Node the
  developer has installed.
- **Cloudflare Workers runtime:** pinned implicitly via
  `wrangler.jsonc`'s `"compatibility_date": "2024-11-01"` — this is the
  Workers runtime feature-set snapshot the Worker builds against, not a
  literal version number. Do not change this date casually; it can
  alter available runtime APIs/behavior.

## Environment variables (deployment-specific)

See `CLAUDE.md` → Environment setup for the full table. The one
variable that matters for deployment:

- **`NEXT_PUBLIC_PARTYKIT_HOST`** must be set in the Vercel project's
  environment variables (Production environment at minimum) to the
  deployed Worker's host, **no protocol prefix** (e.g.
  `chamber-seven.<subdomain>.workers.dev`, not
  `https://chamber-seven...`). This is a **manual, one-time-per-Worker-
  URL step in the Vercel dashboard** — it is not read from
  `wrangler.jsonc` or synced automatically. If the Worker is ever
  redeployed to a different subdomain (shouldn't normally happen, but
  possible if the Cloudflare account/zone changes), this Vercel env var
  must be updated to match, or the deployed frontend will fail to
  connect to any room.

## Domains

No custom domain configuration was found in this repo for either target
— both are running on their platform-default domains
(`*.vercel.app`, `*.workers.dev`). If a custom domain is ever added,
document it here.

## Preview deployments

Vercel's standard preview-deployment behavior applies (a new preview URL
per non-production deploy/branch push, if git integration is connected —
**not independently confirmed this audit** whether Vercel's GitHub
integration is actively connected to auto-deploy on push, vs. all
deploys so far being manual `vercel deploy` CLI invocations; the
deployment history shows very frequent deploys clustered around active
development sessions, consistent with either). Cloudflare Workers via
`wrangler deploy` has no separate "preview" concept in this setup — every
`wrangler deploy` targets the single production Worker directly (no
`--env` staging environment is configured in `wrangler.jsonc`).

## Production deployment steps

**Frontend:**
```bash
npx vercel deploy --prod
```
(or `vercel deploy --prod` if the Vercel CLI is installed globally — this
project's prior sessions have used `npx vercel`). Requires the Vercel
CLI to already be authenticated and linked to this project
(`.vercel/project.json` confirms it already is, in this environment).

**Backend:**
```bash
npx wrangler login   # one-time, only if not already authenticated
npm run deploy:party  # == npx wrangler deploy
```

**Order:** When a change touches `src/lib/game/**` (shared code), deploy
**both** — order between them doesn't functionally matter for a single
in-progress deploy window (very briefly, old-frontend-talking-to-new-
Worker or new-frontend-talking-to-old-Worker could both occur for the
seconds between the two deploy commands finishing), but don't leave a
long gap between the two once you start.

## First-time / fresh-clone setup step easy to miss

`party/tsconfig.json` includes `../worker-configuration.d.ts`, which is
**gitignored and not committed** (verified this audit — see
`FILE_MAP.md`). A fresh clone will be missing this file. Run:
```bash
npx wrangler types
```
before `npm run typecheck:party` will succeed on a fresh clone. This
wasn't previously documented anywhere in the repo — adding it here to
prevent a future session from being confused by an otherwise-mysterious
typecheck failure on first setup.

## Database deployment / migrations

No separate "deploy the database" step exists — Durable Object storage
is provisioned automatically by Cloudflare the first time each DO
instance is accessed. The only "migration" concern is
`wrangler.jsonc`'s `migrations` array (`new_sqlite_classes` tags for
`Main` and `Leaderboard`) — these are already applied in production; see
`DATABASE.md` → Migration risks for what NOT to do to them.

## Storage setup (buckets, etc.)

None — no R2/S3/object storage is used anywhere in this project.

## External service setup

None required — no third-party services beyond Vercel and Cloudflare
themselves.

## Scheduled jobs / webhooks

None configured (`wrangler.jsonc` has no `triggers.crons` entry; no
webhook endpoints exist).

## Known build failures / runtime limitations

- None encountered during this audit's own `npm run build` run (clean
  success, including the uncommitted team-mode code — see
  `PROJECT_STATE.md`).
- **Potential gotcha, not currently a failure:** if `party/tsconfig.json`
  is ever typechecked on a machine that has never run `npx wrangler
  types`, it will fail to resolve `Env`/Workers global types (see
  "First-time setup" above).

## Rollback procedure

- **Frontend (Vercel):** Vercel retains prior deployments — use
  `vercel rollback` (Vercel CLI) or the dashboard's "Promote to
  Production" on a prior deployment to revert without a new build.
- **Backend (Cloudflare):** `npx wrangler deployments list` shows prior
  Worker deployment versions; `npx wrangler rollback [deployment-id]`
  (or the Cloudflare dashboard's Workers → Deployments → rollback UI)
  reverts to a prior version. **Not exercised during this audit** —
  documented from `wrangler`'s standard capability, not independently
  verified against this specific project's deployment history beyond
  confirming `wrangler deployments list` works and shows a real history.

## Deployment checklist

1. Run the full verification suite (`typecheck` × 2, `lint`, `build`).
2. Run the relevant manual smoke-test subset (`TESTING.md`).
3. `npx wrangler deploy --dry-run` to sanity-check the Worker bundle.
4. `npm run deploy:party` (real Worker deploy), if backend code changed.
5. `npx vercel deploy --prod`, if frontend code changed.
6. Re-verify the golden path against the **production** URLs (both the
   Vercel URL and, implicitly, the Worker it talks to) — do not consider
   a deploy "done" on the strength of a local `dev:all` pass alone (see
   `PROJECT_STATE.md`'s note about this session's local dev-server
   flakiness as a concrete reason why).
7. Add/confirm the corresponding `src/lib/changelog.ts` entry is present
   for the release (should already be drafted before this point, per the
   normal workflow observed in this project's history).

## Post-deployment verification

- Load the production URL, confirm the landing page renders and the
  version reflected in `/changelog` matches what was just shipped.
- Start a real match (vs AI is fastest) through to a match-end screen.
- Check `/leaderboard` loads without error (confirms the Worker's HTTP
  route and CORS are working correctly from the production frontend's
  origin).
