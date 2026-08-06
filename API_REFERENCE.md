# API_REFERENCE.md

There is no REST or GraphQL API in the conventional sense. This project
has exactly two server-reachable surfaces:

1. **One WebSocket message protocol** (the vast majority of the app's
   functionality) served by the `Main` Durable Object via `partyserver`.
2. **One plain HTTP GET route** (`/leaderboard`) served by the Worker's
   default `fetch` handler.

Both are defined in `party/game.ts`. Message/type shapes are defined in
`src/lib/game/types.ts`.

---

## WebSocket connection

- **URL pattern:** `wss://<NEXT_PUBLIC_PARTYKIT_HOST>/parties/main/<roomId>`
  (the exact path is constructed by `partysocket`/`partyserver`'s
  `routePartykitRequest` convention — the client only specifies `host`
  and `room` via `usePartySocket({ host, room })` in
  `src/hooks/useGameRoom.ts`; it does not hand-construct the URL).
- **Source file (client):** `src/hooks/useGameRoom.ts`
- **Source file (server):** `party/game.ts`, class `Main extends
  Server<Env>` (from `partyserver`)
- **Authentication:** None at the connection level. Identity/authorization
  happens via the first `join` message (see below).
- **Authorization:** Per-message — `Main.onMessage()` resolves the
  sender's `seat` via `seatFor(state, sender.id)`; any message before a
  successful `join` is rejected with `{type:"error", message:"You have
  not joined this room."}`.

### Client → Server messages (`ClientMessage`, `src/lib/game/types.ts`)

#### `join`
```ts
{ type: "join"; name: string; token?: string; vsAI?: boolean; settings?: GameSettings; botName?: string }
```
- **Purpose:** Claim a seat in the room (or reconnect to a previously-
  claimed seat via `token`). The *first* successful join (when the room
  is fresh and the host seat isn't yet connected) may also set the
  room's `GameSettings`.
- **Source:** `party/game.ts`, `onMessage`'s `if (msg.type === "join")`
  block.
- **Auth:** None beyond an optional `token` (see `claimSeat()` in
  `state.ts` — tries token match first, falls back to claiming any open
  non-bot seat).
- **Side effects:**
  - If `settings` is present, `!state.settingsLocked`, and the host seat
    isn't yet connected: `state.settings = clampSettings(msg.settings)`,
    `state.settingsLocked = true`.
  - Claims a seat via `claimSeat()`.
  - Logs a "joined the room" system message.
  - If `vsAI` is true and the claiming seat is the host seat:
    `fillRemainingSeatsWithBots(state, msg.botName)` — fills every other
    open seat with a bot (only the *first* bot filled gets the
    `botName` override, used by Career Mode to name the opponent after
    the chosen `BotProfile`).
  - Saves state, sends `{type:"welcome", seat, token}` to the sender
    only, then broadcasts the new state to everyone connected.
- **Errors:** `{type:"error", message:"Room is full."}` if `claimSeat()`
  finds no open seat and no matching token.
- **Database operations:** One `getState()` (read) + one `saveState()`
  (write) on the `Main` DO's `"room"` key.

#### `start_game`
```ts
{ type: "start_game" }
```
- **Purpose:** Transition the room from `"lobby"` to `"playing"` and
  deal the first round.
- **Auth:** Any joined seat can send this (not host-restricted at the
  protocol level — the UI only shows the button while `phase ===
  "lobby"`, but the server does not re-check who's asking).
- **Validation:** `phase` must be `"lobby"`; every active seat must be
  `connected` (`activeSeats(state).some(s => !connected)` rejects with
  `"Waiting for all players."`).
- **Side effects:** `startGame(state)` → resets round wins, calls
  `beginRound()` (assigns teams, rolls starting HP, reloads the chamber,
  deals items, logs the round-start message).
- **Errors:** `"Game already started."` / `"Waiting for players."`

#### `fire`
```ts
{ type: "fire"; target: SeatId }
```
- **Purpose:** Fire the shotgun at `target` (which may equal the acting
  seat, for a self-shot).
- **Validation (`fire()` in `state.ts`):** phase must be `"playing"`;
  must be the acting seat's turn; chamber must be non-empty; target must
  be an active, non-eliminated seat; target must not be the acting
  seat's teammate (team modes only).
- **Side effects:** Consumes one shell, applies damage/effects
  (Second Wind, Riot Vest, Scapegoat redirect, Molotov AOE all resolve
  here), logs the outcome, passes or keeps the turn per the rules, may
  end the round/match, may trigger an auto-reload.
- **Errors:** `"Game is not in progress."` / `"It's not your turn."` /
  `"Chamber is empty."` / `"Invalid target."` / `"Can't fire at your own
  teammate."`

#### `use_item`
```ts
{ type: "use_item"; item: ItemId; target?: SeatId }
```
- **Purpose:** Play one item from the acting seat's hand.
- **Validation (`playItem()`):** phase must be `"playing"`; must be the
  acting seat's turn; the item must actually be in the acting seat's
  hand; `second_wind` cannot be played directly (passive-only). Per-item
  target validation happens inside `applyItemEffect()`'s `requireTarget()`
  helper for the items that need one.
- **Side effects:** Removes the item from hand, then runs the specific
  effect (see `FEATURES.md` → Item system, or `src/lib/game/items.ts`
  `ITEM_INFO` for the full list of 23 effects).
- **Errors:** `"Game is not in progress."` / `"It's not your turn."` /
  `"You don't have that item."` / `"Second Wind triggers automatically
  and can't be used directly."` / (per-item) `"Choose another player to
  target."` / `"Invalid target."` / `"Can't target your own teammate."`
  / item-specific no-op messages (logged, not rejected — e.g. using
  Marked Bullet with fewer than 2 shells left in the chamber is not an
  error, it just logs "nothing to swap with" and consumes the item).

#### `rematch`
```ts
{ type: "rematch" }
```
- **Purpose:** Return a finished room to the lobby for another match with
  the same seats/settings.
- **Validation:** `phase` must be `"match_end"`.
- **Side effects:** `phase = "lobby"`, logs "Rematch! Ready up when you
  are." Does **not** reset `settingsLocked` — the room's settings from
  the original `join` remain in effect for the rematch.
- **Errors:** `"Match is not over."`

#### `leave`
```ts
{ type: "leave" }
```
- **Purpose:** Explicitly mark the sending seat disconnected.
- **Side effects:** `markDisconnected(state, seat)`, logs "left the
  room." Functionally similar to what `onClose` does automatically on a
  raw disconnect, but triggered intentionally by the client.

### Server → Client messages (`ServerMessage`)

#### `welcome`
```ts
{ type: "welcome"; seat: SeatId; token: string }
```
Sent once, to the joining connection only, immediately after a
successful `join`. The client stores `token` in
`localStorage["chamber-seven:token:<roomId>"]` for future reconnects.

#### `state`
```ts
{ type: "state"; state: RedactedState }
```
Sent to every connected seat after (almost) every state-mutating
message, individually redacted per-recipient via `redact(state, seat)`.
This is the **only** way the client learns anything about game state —
there is no separate "delta" protocol, every update is a full redacted
snapshot.

#### `error`
```ts
{ type: "error"; message: string }
```
Sent to the requesting connection only, never broadcast. See each
message type above for the specific error strings a given action can
produce.

---

## HTTP endpoints

### `GET /leaderboard`
- **Source file:** `party/game.ts`, the default-exported `fetch` handler
  (`if (url.pathname === "/leaderboard")`)
- **Purpose:** Return the top N leaderboard entries.
- **Authentication:** None.
- **Authorization:** None — fully public, CORS-open
  (`access-control-allow-origin: *`).
- **Parameters:** None (the `limit` parameter to
  `Leaderboard.getTop(limit = 20)` is hardcoded server-side at `20` in
  the `fetch` handler's call — not exposed as a query parameter).
- **Request body:** None (GET).
- **Response:** `LeaderboardEntry[]`, JSON, sorted by `wins` descending
  then `lastWinAt` descending:
  ```json
  [
    { "name": "Alice", "wins": 7, "lastWinAt": 1733500000000 },
    { "name": "Bob", "wins": 3, "lastWinAt": 1733400000000 }
  ]
  ```
- **Status codes:** `200` on success. `OPTIONS` is explicitly handled
  (CORS preflight, returns `204`-equivalent empty response with the CORS
  header) — **no other status code paths were found**; a Durable Object
  RPC failure here is not specifically caught (see `SECURITY.md`/`TESTING.md`
  for the implication — an unhandled exception would surface as
  whatever generic error Cloudflare Workers returns for an uncaught
  throw, not a deliberately-authored error response).
- **Side effects:** None (read-only).
- **Database operations:** One `Leaderboard.getTop(20)` call → one
  `ctx.storage.get("entries")` read.
- **External calls:** None.
- **Rate limits:** None implemented.
- **Known issues:** None beyond the general lack of rate limiting/error
  handling noted above and in `SECURITY.md`.

### (Implicit) WebSocket upgrade routing
- **Source:** `routePartykitRequest` (from `partyserver`), called inside
  the same `fetch` handler for any request that isn't `/leaderboard`.
  This resolves `/parties/<partyName>/<roomName>`-shaped paths to the
  correct Durable Object instance and class, per `partyserver`/PartyKit
  conventions. Not a hand-written route — no further detail to document
  beyond "this is what makes the WebSocket protocol above reachable at
  all."

---

## What does NOT exist

- No Next.js API routes (`src/app/api/`) — none exist in this repo.
- No server actions (`"use server"` functions) — none found.
- No webhooks (incoming or outgoing).
- No external SDKs or service-account-authenticated calls.
- No GraphQL.
- No REST CRUD endpoints for rooms/players/items — all of that is
  exclusively reachable through the WebSocket message protocol above.
