import { nanoid } from "nanoid";
import { weightedRandomItem } from "./items";
import {
  ItemId,
  LogEntry,
  PlayerState,
  RedactedState,
  RoomState,
  SeatId,
  ShellType,
  otherSeat,
} from "./types";

export const MAX_HP = 4;
export const ROUNDS_TO_WIN = 2;
export const HAND_CAP = 8;
export const DRAW_PER_RELOAD = 2;
export const MIN_CHAMBER = 2;
export const MAX_CHAMBER = 8;
export const RECONNECT_GRACE_MS = 2 * 60 * 1000;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makePlayer(seat: SeatId): PlayerState {
  return {
    seat,
    connId: null,
    token: nanoid(24),
    name: seat === "p1" ? "Player 1" : "Player 2",
    hp: MAX_HP,
    maxHp: MAX_HP,
    items: [],
    skipNextTurn: false,
    doubleDamageNext: false,
    connected: false,
    disconnectedAt: null,
  };
}

export function createRoom(roomId: string): RoomState {
  const now = Date.now();
  return {
    roomId,
    phase: "lobby",
    hostSeat: "p1",
    players: { p1: makePlayer("p1"), p2: makePlayer("p2") },
    chamber: [],
    chamberLiveTotal: 0,
    chamberBlankTotal: 0,
    turn: "p1",
    round: 1,
    roundsToWin: ROUNDS_TO_WIN,
    roundWins: { p1: 0, p2: 0 },
    log: [],
    privateLog: { p1: [], p2: [] },
    peekedShell: {},
    bonusDrawFor: null,
    winner: null,
    createdAt: now,
    updatedAt: now,
  };
}

function log(room: RoomState, seat: SeatId | null, message: string) {
  const entry: LogEntry = { id: nanoid(8), ts: Date.now(), seat, message };
  room.log.push(entry);
  if (room.log.length > 200) room.log.shift();
}

function privateLog(room: RoomState, seat: SeatId, message: string) {
  room.privateLog[seat].push({ id: nanoid(8), ts: Date.now(), message });
  if (room.privateLog[seat].length > 50) room.privateLog[seat].shift();
}

/** Finds an open seat for a new connection, or the seat matching a reconnect token. */
export function claimSeat(
  room: RoomState,
  connId: string,
  name: string,
  token?: string,
): { seat: SeatId; error?: undefined } | { seat?: undefined; error: string } {
  if (token) {
    for (const seat of ["p1", "p2"] as SeatId[]) {
      if (room.players[seat].token === token) {
        room.players[seat].connId = connId;
        room.players[seat].connected = true;
        room.players[seat].disconnectedAt = null;
        return { seat };
      }
    }
  }
  for (const seat of ["p1", "p2"] as SeatId[]) {
    const p = room.players[seat];
    if (!p.connected && p.connId === null && (room.phase === "lobby" || p.disconnectedAt !== null)) {
      p.connId = connId;
      p.connected = true;
      p.disconnectedAt = null;
      p.name = name.slice(0, 20) || p.name;
      return { seat };
    }
  }
  return { error: "Room is full." };
}

export function markDisconnected(room: RoomState, seat: SeatId) {
  const p = room.players[seat];
  p.connected = false;
  p.connId = null;
  p.disconnectedAt = Date.now();
}

function drawItems(room: RoomState, seat: SeatId, count: number) {
  const p = room.players[seat];
  for (let i = 0; i < count && p.items.length < HAND_CAP; i++) {
    p.items.push(weightedRandomItem());
  }
}

function reload(room: RoomState) {
  const size = randomInt(MIN_CHAMBER, MAX_CHAMBER);
  const live = randomInt(1, size - 1);
  const blank = size - live;
  const shells: ShellType[] = shuffle([
    ...Array(live).fill("live" as const),
    ...Array(blank).fill("blank" as const),
  ]);
  room.chamber = shells;
  room.chamberLiveTotal = live;
  room.chamberBlankTotal = blank;
  room.peekedShell = {};
  log(room, null, `The chamber is reloaded: ${live} live, ${blank} blank.`);

  for (const seat of ["p1", "p2"] as SeatId[]) {
    let draws = DRAW_PER_RELOAD;
    if (room.bonusDrawFor === seat) draws += 1;
    drawItems(room, seat, draws);
  }
  room.bonusDrawFor = null;
}

export function startGame(room: RoomState) {
  room.phase = "playing";
  room.round = 1;
  room.roundWins = { p1: 0, p2: 0 };
  room.winner = null;
  for (const seat of ["p1", "p2"] as SeatId[]) {
    const p = room.players[seat];
    p.hp = p.maxHp;
    p.items = [];
    p.skipNextTurn = false;
    p.doubleDamageNext = false;
  }
  room.turn = Math.random() < 0.5 ? "p1" : "p2";
  reload(room);
  log(room, null, `Round 1 begins. ${room.turn === "p1" ? room.players.p1.name : room.players.p2.name} goes first.`);
}

function startNextRound(room: RoomState) {
  room.round += 1;
  for (const seat of ["p1", "p2"] as SeatId[]) {
    const p = room.players[seat];
    p.hp = p.maxHp;
    p.items = [];
    p.skipNextTurn = false;
    p.doubleDamageNext = false;
  }
  room.turn = room.round % 2 === 1 ? room.hostSeat : otherSeat(room.hostSeat);
  reload(room);
  log(room, null, `Round ${room.round} begins.`);
}

function endRound(room: RoomState, winnerSeat: SeatId) {
  room.roundWins[winnerSeat] += 1;
  log(room, null, `${room.players[winnerSeat].name} wins round ${room.round}!`);
  if (room.roundWins[winnerSeat] >= room.roundsToWin) {
    room.phase = "match_end";
    room.winner = winnerSeat;
    log(room, null, `${room.players[winnerSeat].name} wins the match!`);
  } else {
    startNextRound(room);
  }
}

/** Applies damage, honoring Second Wind. Returns true if the round just ended. */
function applyDamage(room: RoomState, seat: SeatId, amount: number): boolean {
  const p = room.players[seat];
  const newHp = p.hp - amount;
  if (newHp <= 0) {
    if (p.items.includes("second_wind")) {
      p.items.splice(p.items.indexOf("second_wind"), 1);
      p.hp = 1;
      log(room, seat, `${p.name}'s Second Wind kicks in, surviving at 1 HP!`);
      return false;
    }
    p.hp = 0;
    endRound(room, otherSeat(seat));
    return true;
  }
  p.hp = newHp;
  return false;
}

function passTurnFrom(room: RoomState, fromSeat: SeatId) {
  const next = otherSeat(fromSeat);
  const nextPlayer = room.players[next];
  if (nextPlayer.skipNextTurn) {
    nextPlayer.skipNextTurn = false;
    log(room, next, `${nextPlayer.name}'s turn is skipped (Irons).`);
    room.turn = fromSeat;
  } else {
    room.turn = next;
  }
}

function maybeReload(room: RoomState) {
  if (room.phase === "playing" && room.chamber.length === 0) {
    reload(room);
  }
}

export type ActionResult = { ok: true } | { ok: false; error: string };

export function fire(room: RoomState, actingSeat: SeatId, target: "self" | "opponent"): ActionResult {
  if (room.phase !== "playing") return { ok: false, error: "Game is not in progress." };
  if (room.turn !== actingSeat) return { ok: false, error: "It's not your turn." };
  if (room.chamber.length === 0) return { ok: false, error: "Chamber is empty." };

  const actor = room.players[actingSeat];
  const shell = room.chamber.shift()!;
  room.peekedShell = {};

  const damage = actor.doubleDamageNext ? 2 : 1;
  actor.doubleDamageNext = false;

  if (target === "self") {
    log(room, actingSeat, `${actor.name} points it at themselves: ${shell.toUpperCase()}.`);
    if (shell === "live") {
      const ended = applyDamage(room, actingSeat, damage);
      if (!ended) passTurnFrom(room, actingSeat);
    }
    // blank: keep the turn, no pass.
  } else {
    const opponentSeat = otherSeat(actingSeat);
    const opponent = room.players[opponentSeat];
    log(room, actingSeat, `${actor.name} fires at ${opponent.name}: ${shell.toUpperCase()}.`);
    if (shell === "live") {
      const ended = applyDamage(room, opponentSeat, damage);
      if (!ended) passTurnFrom(room, actingSeat);
    } else {
      passTurnFrom(room, actingSeat);
    }
  }

  maybeReload(room);
  room.updatedAt = Date.now();
  return { ok: true };
}

function applyItemEffect(room: RoomState, actingSeat: SeatId, item: ItemId): ActionResult {
  const actor = room.players[actingSeat];
  const opponentSeat = otherSeat(actingSeat);
  const opponent = room.players[opponentSeat];

  switch (item) {
    case "loupe": {
      if (room.chamber.length === 0) return { ok: false, error: "Chamber is empty." };
      room.peekedShell[actingSeat] = room.chamber[0];
      privateLog(room, actingSeat, `You peek: the next shell is ${room.chamber[0].toUpperCase()}.`);
      log(room, actingSeat, `${actor.name} peers through the Loupe.`);
      return { ok: true };
    }
    case "irons": {
      opponent.skipNextTurn = true;
      log(room, actingSeat, `${actor.name} slaps Irons on ${opponent.name}.`);
      return { ok: true };
    }
    case "hacksaw": {
      actor.doubleDamageNext = true;
      log(room, actingSeat, `${actor.name} racks the Hacksaw. Next live shot deals double damage.`);
      return { ok: true };
    }
    case "flask": {
      if (room.chamber.length === 0) return { ok: false, error: "Chamber is empty." };
      const shell = room.chamber.shift()!;
      room.peekedShell = {};
      log(room, actingSeat, `${actor.name} racks the Flask, ejecting a ${shell.toUpperCase()} shell.`);
      maybeReload(room);
      return { ok: true };
    }
    case "adrenal_shot": {
      if (opponent.items.length === 0) {
        log(room, actingSeat, `${actor.name} reaches for Adrenal Shot, but ${opponent.name} has nothing to steal.`);
        return { ok: true };
      }
      const idx = randomInt(0, opponent.items.length - 1);
      const stolen = opponent.items.splice(idx, 1)[0];
      log(room, actingSeat, `${actor.name} uses Adrenal Shot, stealing and using ${opponent.name}'s ${stolen}.`);
      if (stolen === "second_wind") {
        actor.items.push("second_wind");
        return { ok: true };
      }
      return applyItemEffect(room, actingSeat, stolen);
    }
    case "marked_bullet": {
      if (room.chamber.length < 2) {
        log(room, actingSeat, `${actor.name} tries a Marked Bullet, but there's nothing to swap with.`);
        return { ok: true };
      }
      const swapIdx = randomInt(1, room.chamber.length - 1);
      [room.chamber[0], room.chamber[swapIdx]] = [room.chamber[swapIdx], room.chamber[0]];
      room.peekedShell = {};
      log(room, actingSeat, `${actor.name} blindly swaps the next shell with a Marked Bullet.`);
      return { ok: true };
    }
    case "counterfeit_chip": {
      if (opponent.items.length === 0) {
        log(room, actingSeat, `${actor.name} flashes a Counterfeit Chip, but ${opponent.name} has no items.`);
        return { ok: true };
      }
      const seen = opponent.items[randomInt(0, opponent.items.length - 1)];
      privateLog(room, actingSeat, `You spy: ${opponent.name} is holding a ${seen}.`);
      log(room, actingSeat, `${actor.name} flashes a Counterfeit Chip at ${opponent.name}.`);
      return { ok: true };
    }
    case "smoke_bomb": {
      room.bonusDrawFor = opponentSeat;
      log(room, actingSeat, `${actor.name} vanishes in a Smoke Bomb, ending their turn safely.`);
      passTurnFrom(room, actingSeat);
      maybeReload(room);
      return { ok: true };
    }
    case "silver_tongue": {
      if (opponent.items.length === 0) {
        log(room, actingSeat, `${actor.name} tries Silver Tongue, but ${opponent.name} has nothing to lose.`);
        return { ok: true };
      }
      const idx = randomInt(0, opponent.items.length - 1);
      const lost = opponent.items.splice(idx, 1)[0];
      privateLog(room, opponentSeat, `Silver Tongue talked you out of your ${lost}.`);
      log(room, actingSeat, `${actor.name} uses Silver Tongue on ${opponent.name}.`);
      return { ok: true };
    }
    case "second_wind":
      return { ok: false, error: "Second Wind triggers automatically and can't be used directly." };
  }
}

export function useItem(room: RoomState, actingSeat: SeatId, item: ItemId): ActionResult {
  if (room.phase !== "playing") return { ok: false, error: "Game is not in progress." };
  if (room.turn !== actingSeat) return { ok: false, error: "It's not your turn." };
  const actor = room.players[actingSeat];
  const idx = actor.items.indexOf(item);
  if (idx === -1) return { ok: false, error: "You don't have that item." };
  if (item === "second_wind") return { ok: false, error: "Second Wind triggers automatically and can't be used directly." };
  actor.items.splice(idx, 1);
  const result = applyItemEffect(room, actingSeat, item);
  room.updatedAt = Date.now();
  return result;
}

export function addSystemLog(room: RoomState, message: string) {
  log(room, null, message);
}

export function redact(room: RoomState, forSeat: SeatId): RedactedState {
  const you = room.players[forSeat];
  const opp = room.players[otherSeat(forSeat)];
  return {
    roomId: room.roomId,
    phase: room.phase,
    you: forSeat,
    hostSeat: room.hostSeat,
    players: {
      [forSeat]: {
        seat: forSeat,
        name: you.name,
        hp: you.hp,
        maxHp: you.maxHp,
        itemCount: you.items.length,
        items: you.items,
        connected: you.connected,
      },
      [otherSeat(forSeat)]: {
        seat: otherSeat(forSeat),
        name: opp.name,
        hp: opp.hp,
        maxHp: opp.maxHp,
        itemCount: opp.items.length,
        items: null,
        connected: opp.connected,
      },
    } as RedactedState["players"],
    chamberRemaining: room.chamber.length,
    chamberLiveTotal: room.chamberLiveTotal,
    chamberBlankTotal: room.chamberBlankTotal,
    turn: room.turn,
    round: room.round,
    roundsToWin: room.roundsToWin,
    roundWins: room.roundWins,
    log: room.log,
    privateLog: room.privateLog[forSeat],
    peekedShell: room.peekedShell[forSeat] ?? null,
    winner: room.winner,
  };
}
