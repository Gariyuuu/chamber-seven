import { nanoid } from "nanoid";
import { ALL_ITEM_IDS, weightedRandomItem } from "./items";
import {
  ALL_SEATS,
  GameSettings,
  ItemId,
  LogEntry,
  PlayerState,
  RedactedState,
  RoomState,
  SeatId,
  ShellType,
  TeamMode,
} from "./types";

export const DEFAULT_SETTINGS: GameSettings = {
  playerCount: 2,
  roundsToWin: 2,
  hpMin: 4,
  hpMax: 12,
  itemsPerReload: 3,
  enabledItems: ALL_ITEM_IDS,
  botSkill: 1,
  teamMode: "none",
};

/** Bonus items the boss draws every reload, on top of the normal itemsPerReload. */
const BOSS_BONUS_DRAWS = 2;

export const HAND_CAP = 10;
export const MIN_CHAMBER = 2;
export const MAX_CHAMBER = 8;
export const RECONNECT_GRACE_MS = 2 * 60 * 1000;

const BOT_NAMES: Record<SeatId, string> = {
  p1: "Player 1",
  p2: "The Dealer",
  p3: "The Croupier",
  p4: "The Shark",
};

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

export function clampSettings(input: Partial<GameSettings>): GameSettings {
  const playerCount = ([2, 3, 4].includes(input.playerCount as number) ? input.playerCount : 2) as 2 | 3 | 4;
  let teamMode: TeamMode = (["none", "duos", "boss"] as TeamMode[]).includes(input.teamMode as TeamMode)
    ? (input.teamMode as TeamMode)
    : "none";
  if (teamMode === "duos" && playerCount !== 4) teamMode = "none";
  let roundsToWin = ([1, 2, 3].includes(input.roundsToWin as number) ? input.roundsToWin : 2) as 1 | 2 | 3;
  if (teamMode !== "none") roundsToWin = 1;
  let hpMin = Math.round(input.hpMin ?? DEFAULT_SETTINGS.hpMin);
  let hpMax = Math.round(input.hpMax ?? DEFAULT_SETTINGS.hpMax);
  hpMin = Math.min(Math.max(hpMin, 2), 20);
  hpMax = Math.min(Math.max(hpMax, 2), 20);
  if (hpMin > hpMax) [hpMin, hpMax] = [hpMax, hpMin];
  const itemsPerReload = Math.min(Math.max(Math.round(input.itemsPerReload ?? DEFAULT_SETTINGS.itemsPerReload), 1), 5);
  const validItems = new Set(ALL_ITEM_IDS);
  const requestedItems = Array.isArray(input.enabledItems)
    ? input.enabledItems.filter((item): item is ItemId => validItems.has(item))
    : [];
  const enabledItems = requestedItems.length > 0 ? Array.from(new Set(requestedItems)) : ALL_ITEM_IDS;
  const botSkillRaw = typeof input.botSkill === "number" ? input.botSkill : DEFAULT_SETTINGS.botSkill;
  const botSkill = Math.min(1, Math.max(0, botSkillRaw));
  return { playerCount, roundsToWin, hpMin, hpMax, itemsPerReload, enabledItems, botSkill, teamMode };
}

function makePlayer(seat: SeatId): PlayerState {
  return {
    seat,
    connId: null,
    token: nanoid(24),
    name: `Player ${seat.slice(1)}`,
    hp: DEFAULT_SETTINGS.hpMax,
    maxHp: DEFAULT_SETTINGS.hpMax,
    items: [],
    skipNextTurn: false,
    doubleDamageNext: false,
    tripleDamageNext: false,
    forceLiveNext: false,
    shieldedNext: false,
    molotovNext: false,
    redirectTo: null,
    connected: false,
    disconnectedAt: null,
    isBot: false,
    eliminated: false,
    team: null,
  };
}

export function createRoom(roomId: string): RoomState {
  const now = Date.now();
  const players = {} as Record<SeatId, PlayerState>;
  for (const seat of ALL_SEATS) players[seat] = makePlayer(seat);
  const roundWins = {} as Record<SeatId, number>;
  const privateLog = {} as Record<SeatId, RoomState["privateLog"][SeatId]>;
  for (const seat of ALL_SEATS) {
    roundWins[seat] = 0;
    privateLog[seat] = [];
  }
  return {
    roomId,
    phase: "lobby",
    hostSeat: "p1",
    settings: DEFAULT_SETTINGS,
    settingsLocked: false,
    players,
    chamber: [],
    chamberLiveTotal: 0,
    chamberBlankTotal: 0,
    turn: "p1",
    round: 1,
    roundWins,
    log: [],
    privateLog,
    peekedShell: {},
    bonusDrawFor: null,
    scapegoatEverDrawn: false,
    winnerRecorded: false,
    winner: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function activeSeats(room: RoomState): SeatId[] {
  return ALL_SEATS.slice(0, room.settings.playerCount);
}

export function aliveActiveSeats(room: RoomState): SeatId[] {
  return activeSeats(room).filter((s) => !room.players[s].eliminated);
}

/** In boss mode, the boss is always the last active seat — the last bot filled, in vs-AI games. */
export function bossSeatOf(room: RoomState): SeatId | null {
  if (room.settings.teamMode !== "boss") return null;
  const seats = activeSeats(room);
  return seats[seats.length - 1] ?? null;
}

function assignTeams(room: RoomState) {
  const seats = activeSeats(room);
  if (room.settings.teamMode === "duos") {
    seats.forEach((seat, i) => {
      room.players[seat].team = i % 2 === 0 ? 0 : 1;
    });
  } else if (room.settings.teamMode === "boss") {
    const boss = bossSeatOf(room);
    seats.forEach((seat) => {
      room.players[seat].team = seat === boss ? 1 : 0;
    });
  } else {
    seats.forEach((seat) => {
      room.players[seat].team = null;
    });
  }
}

function isTeammate(room: RoomState, a: SeatId, b: SeatId): boolean {
  if (room.settings.teamMode === "none" || a === b) return false;
  const ta = room.players[a].team;
  const tb = room.players[b].team;
  return ta !== null && ta === tb;
}

/** Returns the sole surviving seat once a round is decided, honoring team modes — null if still contested. */
function roundOver(room: RoomState): SeatId | null {
  const alive = aliveActiveSeats(room);
  if (alive.length === 0) return null;
  if (room.settings.teamMode === "none") {
    return alive.length <= 1 ? alive[0] : null;
  }
  const teams = new Set(alive.map((s) => room.players[s].team));
  return teams.size === 1 ? alive[0] : null;
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

export function addSystemLog(room: RoomState, message: string) {
  log(room, null, message);
}

/** Finds an open active seat for a new connection, or the seat matching a reconnect token. */
export function claimSeat(
  room: RoomState,
  connId: string,
  name: string,
  token?: string,
): { seat: SeatId; error?: undefined } | { seat?: undefined; error: string } {
  if (token) {
    for (const seat of activeSeats(room)) {
      if (room.players[seat].token === token) {
        room.players[seat].connId = connId;
        room.players[seat].connected = true;
        room.players[seat].disconnectedAt = null;
        return { seat };
      }
    }
  }
  for (const seat of activeSeats(room)) {
    const p = room.players[seat];
    if (p.isBot) continue;
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

/** Seats a bot at the given seat. Call in the lobby, before startGame. */
export function fillBotSeat(room: RoomState, seat: SeatId, nameOverride?: string) {
  const p = room.players[seat];
  p.isBot = true;
  p.name = nameOverride ?? BOT_NAMES[seat] ?? `Bot ${seat}`;
  p.connected = true;
  p.connId = null;
  addSystemLog(room, `${p.name} sits down across the table.`);
}

/** `firstBotName` overrides only the first bot seat filled — used by the career/roster picker
 *  where the player chose a specific named opponent; generic multi-seat FFA fill leaves it unset. */
export function fillRemainingSeatsWithBots(room: RoomState, firstBotName?: string) {
  let usedOverride = false;
  for (const seat of activeSeats(room)) {
    if (seat === room.hostSeat) continue;
    const p = room.players[seat];
    if (!p.connected && !p.isBot) {
      fillBotSeat(room, seat, !usedOverride ? firstBotName : undefined);
      usedOverride = true;
    }
  }
}

export function isBotTurn(room: RoomState): boolean {
  return room.players[room.turn].isBot;
}

const DRAW_REROLL_ATTEMPTS = 20;

/** Items capped at holding one per player at a time (per round, since hands reset each round). */
function canHoldAnother(room: RoomState, seat: SeatId, item: ItemId): boolean {
  if (item === "irons" || item === "vultures_due") {
    return !room.players[seat].items.includes(item);
  }
  if (item === "scapegoat") {
    return !room.scapegoatEverDrawn;
  }
  return true;
}

function drawItems(room: RoomState, seat: SeatId, count: number) {
  const p = room.players[seat];
  for (let i = 0; i < count && p.items.length < HAND_CAP; i++) {
    let item: ItemId | null = null;
    for (let attempt = 0; attempt < DRAW_REROLL_ATTEMPTS; attempt++) {
      const candidate = weightedRandomItem(room.settings.enabledItems);
      if (canHoldAnother(room, seat, candidate)) {
        item = candidate;
        break;
      }
    }
    if (!item) continue;
    p.items.push(item);
    if (item === "scapegoat") room.scapegoatEverDrawn = true;
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

  const boss = bossSeatOf(room);
  for (const seat of activeSeats(room)) {
    let draws = room.settings.itemsPerReload;
    if (seat === boss) draws += BOSS_BONUS_DRAWS;
    if (room.bonusDrawFor === seat) draws += 1;
    drawItems(room, seat, draws);
  }
  room.bonusDrawFor = null;
}

function beginRound(room: RoomState, startingSeat: SeatId) {
  assignTeams(room);
  const hp = randomInt(room.settings.hpMin, room.settings.hpMax);
  const boss = bossSeatOf(room);
  const bossHpMultiplier = Math.max(1, activeSeats(room).length - 1);
  for (const seat of activeSeats(room)) {
    const p = room.players[seat];
    const seatHp = seat === boss ? hp * bossHpMultiplier : hp;
    p.hp = seatHp;
    p.maxHp = seatHp;
    p.items = [];
    p.skipNextTurn = false;
    p.doubleDamageNext = false;
    p.tripleDamageNext = false;
    p.forceLiveNext = false;
    p.shieldedNext = false;
    p.molotovNext = false;
    p.redirectTo = null;
    p.eliminated = false;
  }
  room.turn = startingSeat;
  reload(room);
  if (boss) {
    log(
      room,
      null,
      `Round ${room.round} begins. ${room.players[boss].name} the Boss enters with ${room.players[boss].hp} HP; everyone else has ${hp}. ${room.players[startingSeat].name} goes first.`,
    );
  } else {
    log(
      room,
      null,
      `Round ${room.round} begins with ${hp} HP each. ${room.players[startingSeat].name} goes first.`,
    );
  }
}

export function startGame(room: RoomState) {
  room.phase = "playing";
  room.round = 1;
  for (const seat of ALL_SEATS) room.roundWins[seat] = 0;
  room.winner = null;
  room.scapegoatEverDrawn = false;
  room.winnerRecorded = false;
  beginRound(room, activeSeats(room)[0]);
}

function startNextRound(room: RoomState) {
  room.round += 1;
  const seats = activeSeats(room);
  const startingSeat = seats[(room.round - 1) % seats.length];
  beginRound(room, startingSeat);
}

function endRound(room: RoomState, winnerSeat: SeatId) {
  room.roundWins[winnerSeat] += 1;
  log(room, null, `${room.players[winnerSeat].name} wins round ${room.round}!`);
  if (room.roundWins[winnerSeat] >= room.settings.roundsToWin) {
    room.phase = "match_end";
    room.winner = winnerSeat;
    log(room, null, `${room.players[winnerSeat].name} wins the match!`);
  } else {
    startNextRound(room);
  }
}

/** Applies damage, honoring Second Wind and elimination. Returns true if the round just ended. */
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
    p.eliminated = true;
    log(room, seat, `${p.name} is eliminated!`);
    const winner = roundOver(room);
    if (winner) {
      endRound(room, winner);
      return true;
    }
    return false;
  }
  p.hp = newHp;
  return false;
}

/** Resolves a hit on a target, honoring Scapegoat redirection and Riot Vest. Returns true if the round ended. */
function resolveHit(room: RoomState, targetSeat: SeatId, amount: number): boolean {
  let seat = targetSeat;
  const original = room.players[seat];
  if (original.redirectTo) {
    const redirected = original.redirectTo;
    original.redirectTo = null;
    if (redirected !== seat && !room.players[redirected].eliminated) {
      log(room, seat, `${original.name}'s Scapegoat redirects the shot to ${room.players[redirected].name}!`);
      seat = redirected;
    }
  }
  const p = room.players[seat];
  if (p.shieldedNext) {
    p.shieldedNext = false;
    log(room, seat, `${p.name}'s Riot Vest absorbs the hit!`);
    return false;
  }
  return applyDamage(room, seat, amount);
}

function nextAliveSeat(room: RoomState, fromSeat: SeatId): SeatId {
  const seats = activeSeats(room);
  const idx = seats.indexOf(fromSeat);
  for (let i = 1; i <= seats.length; i++) {
    const candidate = seats[(idx + i) % seats.length];
    if (!room.players[candidate].eliminated) return candidate;
  }
  return fromSeat;
}

function passTurnFrom(room: RoomState, fromSeat: SeatId) {
  let next = nextAliveSeat(room, fromSeat);
  let guard = 0;
  while (room.players[next].skipNextTurn && guard++ < activeSeats(room).length) {
    room.players[next].skipNextTurn = false;
    log(room, next, `${room.players[next].name}'s turn is skipped (Irons).`);
    next = nextAliveSeat(room, next);
  }
  room.turn = next;
}

/** Called when a connected human fails to reconnect within the grace period. */
export function forfeitSeat(room: RoomState, seat: SeatId) {
  const p = room.players[seat];
  if (p.eliminated) return;
  p.eliminated = true;
  p.hp = 0;
  addSystemLog(room, `${p.name} did not reconnect in time and is eliminated.`);
  const winner = roundOver(room);
  if (winner) {
    endRound(room, winner);
  } else if (room.turn === seat) {
    passTurnFrom(room, seat);
  }
}

function maybeReload(room: RoomState) {
  if (room.phase === "playing" && room.chamber.length === 0) {
    reload(room);
  }
}

/**
 * Live/blank counts still left in the chamber. This is arithmetic any attentive
 * player could reconstruct from the public log (loaded totals minus fired shells),
 * so exposing it to the bot isn't unfair — it just skips the bookkeeping.
 */
function remainingComposition(room: RoomState): { live: number; blank: number } {
  let live = 0;
  let blank = 0;
  for (const shell of room.chamber) {
    if (shell === "live") live++;
    else blank++;
  }
  return { live, blank };
}

export type ActionResult = { ok: true } | { ok: false; error: string };

export function fire(room: RoomState, actingSeat: SeatId, targetSeat: SeatId): ActionResult {
  if (room.phase !== "playing") return { ok: false, error: "Game is not in progress." };
  if (room.turn !== actingSeat) return { ok: false, error: "It's not your turn." };
  if (room.chamber.length === 0) return { ok: false, error: "Chamber is empty." };
  if (!activeSeats(room).includes(targetSeat) || room.players[targetSeat].eliminated) {
    return { ok: false, error: "Invalid target." };
  }
  if (targetSeat !== actingSeat && isTeammate(room, actingSeat, targetSeat)) {
    return { ok: false, error: "Can't fire at your own teammate." };
  }

  const actor = room.players[actingSeat];
  let shell = room.chamber.shift()!;
  room.peekedShell = {};

  if (actor.forceLiveNext) {
    shell = "live";
    actor.forceLiveNext = false;
  }

  const damage = actor.tripleDamageNext ? 3 : actor.doubleDamageNext ? 2 : 1;
  actor.doubleDamageNext = false;
  actor.tripleDamageNext = false;
  const molotov = actor.molotovNext;
  actor.molotovNext = false;

  const isSelf = targetSeat === actingSeat;

  if (isSelf) {
    log(room, actingSeat, `${actor.name} points it at themselves: ${shell.toUpperCase()}.`);
    if (shell === "live") {
      const ended = resolveHit(room, actingSeat, damage);
      if (!ended) passTurnFrom(room, actingSeat);
    }
    // blank: keep the turn, no pass.
  } else if (molotov) {
    const targets = aliveActiveSeats(room).filter((s) => s !== actingSeat && !isTeammate(room, actingSeat, s));
    log(
      room,
      actingSeat,
      `${actor.name} throws a Molotov — it catches ${room.settings.teamMode === "none" ? "everyone" : "every enemy"}: ${shell.toUpperCase()}.`,
    );
    let roundEnded = false;
    if (shell === "live") {
      for (const t of targets) {
        if (room.players[t].eliminated) continue;
        if (resolveHit(room, t, damage)) {
          roundEnded = true;
          break;
        }
      }
    }
    if (!roundEnded) passTurnFrom(room, actingSeat);
  } else {
    const target = room.players[targetSeat];
    log(room, actingSeat, `${actor.name} fires at ${target.name}: ${shell.toUpperCase()}.`);
    if (shell === "live") {
      const ended = resolveHit(room, targetSeat, damage);
      if (!ended) passTurnFrom(room, actingSeat);
    } else {
      passTurnFrom(room, actingSeat);
    }
  }

  maybeReload(room);
  room.updatedAt = Date.now();
  return { ok: true };
}

function applyItemEffect(
  room: RoomState,
  actingSeat: SeatId,
  item: ItemId,
  targetSeat?: SeatId,
): ActionResult {
  const actor = room.players[actingSeat];

  function requireTarget(): PlayerState | ActionResult {
    if (!targetSeat || targetSeat === actingSeat) {
      return { ok: false, error: "Choose another player to target." };
    }
    const target = room.players[targetSeat];
    if (!activeSeats(room).includes(targetSeat) || target.eliminated) {
      return { ok: false, error: "Invalid target." };
    }
    if (isTeammate(room, actingSeat, targetSeat)) {
      return { ok: false, error: "Can't target your own teammate." };
    }
    return target;
  }

  switch (item) {
    case "loupe": {
      if (room.chamber.length === 0) return { ok: false, error: "Chamber is empty." };
      room.peekedShell[actingSeat] = room.chamber[0];
      privateLog(room, actingSeat, `You peek: the next shell is ${room.chamber[0].toUpperCase()}.`);
      log(room, actingSeat, `${actor.name} peers through the Loupe.`);
      return { ok: true };
    }
    case "irons": {
      const target = requireTarget();
      if ("ok" in target) return target;
      target.skipNextTurn = true;
      log(room, actingSeat, `${actor.name} slaps Irons on ${target.name}.`);
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
      const target = requireTarget();
      if ("ok" in target) return target;
      if (target.items.length === 0) {
        log(room, actingSeat, `${actor.name} reaches for Adrenal Shot, but ${target.name} has nothing to steal.`);
        return { ok: true };
      }
      const idx = randomInt(0, target.items.length - 1);
      const stolen = target.items.splice(idx, 1)[0];
      log(room, actingSeat, `${actor.name} uses Adrenal Shot, stealing and using ${target.name}'s ${stolen}.`);
      if (stolen === "second_wind") {
        actor.items.push("second_wind");
        return { ok: true };
      }
      return applyItemEffect(room, actingSeat, stolen, targetSeat);
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
      const target = requireTarget();
      if ("ok" in target) return target;
      if (target.items.length === 0) {
        log(room, actingSeat, `${actor.name} flashes a Counterfeit Chip, but ${target.name} has no items.`);
        return { ok: true };
      }
      const seen = target.items[randomInt(0, target.items.length - 1)];
      privateLog(room, actingSeat, `You spy: ${target.name} is holding a ${seen}.`);
      log(room, actingSeat, `${actor.name} flashes a Counterfeit Chip at ${target.name}.`);
      return { ok: true };
    }
    case "smoke_bomb": {
      const others = aliveActiveSeats(room).filter((s) => s !== actingSeat);
      if (others.length > 0) room.bonusDrawFor = others[randomInt(0, others.length - 1)];
      log(room, actingSeat, `${actor.name} vanishes in a Smoke Bomb, ending their turn safely.`);
      passTurnFrom(room, actingSeat);
      maybeReload(room);
      return { ok: true };
    }
    case "silver_tongue": {
      const target = requireTarget();
      if ("ok" in target) return target;
      if (target.items.length === 0) {
        log(room, actingSeat, `${actor.name} tries Silver Tongue, but ${target.name} has nothing to lose.`);
        return { ok: true };
      }
      const idx = randomInt(0, target.items.length - 1);
      const lost = target.items.splice(idx, 1)[0];
      privateLog(room, target.seat, `Silver Tongue talked you out of your ${lost}.`);
      log(room, actingSeat, `${actor.name} uses Silver Tongue on ${target.name}.`);
      return { ok: true };
    }
    case "riot_vest": {
      actor.shieldedNext = true;
      log(room, actingSeat, `${actor.name} straps on a Riot Vest.`);
      return { ok: true };
    }
    case "molotov": {
      actor.molotovNext = true;
      log(room, actingSeat, `${actor.name} uncorks a Molotov — their next shot will catch everyone.`);
      return { ok: true };
    }
    case "vultures_due": {
      const target = requireTarget();
      if ("ok" in target) return target;
      if (target.hp <= 1) {
        log(room, actingSeat, `${actor.name} tries Vulture's Due, but ${target.name} has nothing left to take.`);
        return { ok: true };
      }
      target.hp -= 1;
      actor.hp = Math.min(actor.maxHp, actor.hp + 1);
      log(room, actingSeat, `${actor.name} uses Vulture's Due, draining 1 HP from ${target.name}.`);
      return { ok: true };
    }
    case "false_confession": {
      const target = requireTarget();
      if ("ok" in target) return target;
      const summary = target.items.length > 0 ? target.items.join(", ") : "nothing";
      privateLog(room, actingSeat, `${target.name}'s hand: ${summary}.`);
      log(room, actingSeat, `${actor.name} forces a False Confession from ${target.name}.`);
      return { ok: true };
    }
    case "loaded_dice": {
      room.chamber = shuffle(room.chamber);
      room.peekedShell = {};
      log(room, actingSeat, `${actor.name} rolls Loaded Dice — the whole chamber is reshuffled.`);
      return { ok: true };
    }
    case "bribe": {
      drawItems(room, actingSeat, 2);
      log(room, actingSeat, `${actor.name} pays a Bribe, drawing two items and ending their turn.`);
      passTurnFrom(room, actingSeat);
      return { ok: true };
    }
    case "point_blank": {
      actor.forceLiveNext = true;
      log(room, actingSeat, `${actor.name} loads a Point Blank round — their next shot is guaranteed live.`);
      return { ok: true };
    }
    case "sleight_of_hand": {
      const target = requireTarget();
      if ("ok" in target) return target;
      const temp = actor.items;
      actor.items = target.items;
      target.items = temp;
      log(room, actingSeat, `${actor.name} pulls Sleight of Hand, swapping hands with ${target.name}.`);
      return { ok: true };
    }
    case "last_rites": {
      const eliminatedSeats = activeSeats(room).filter((s) => room.players[s].eliminated);
      if (eliminatedSeats.length === 0) {
        log(room, actingSeat, `${actor.name} performs Last Rites, but no one has fallen yet.`);
        return { ok: true };
      }
      const revived = room.players[eliminatedSeats[randomInt(0, eliminatedSeats.length - 1)]];
      revived.eliminated = false;
      revived.hp = 1;
      log(room, actingSeat, `${actor.name} performs Last Rites — ${revived.name} rejoins the table at 1 HP!`);
      return { ok: true };
    }
    case "scapegoat": {
      const target = requireTarget();
      if ("ok" in target) return target;
      actor.redirectTo = target.seat;
      log(room, actingSeat, `${actor.name} sets up a Scapegoat — the next hit lands on ${target.name}.`);
      return { ok: true };
    }
    case "magnum_load": {
      actor.tripleDamageNext = true;
      log(room, actingSeat, `${actor.name} chambers a Magnum Load. Next live shot deals triple damage.`);
      return { ok: true };
    }
    case "patch_kit": {
      const before = actor.hp;
      actor.hp = Math.min(actor.maxHp, actor.hp + 1);
      const healed = actor.hp - before;
      if (actor.items.length > 0) {
        const idx = randomInt(0, actor.items.length - 1);
        const cost = actor.items.splice(idx, 1)[0];
        log(room, actingSeat, `${actor.name} uses a Patch Kit, healing ${healed} HP but losing their ${cost}.`);
      } else {
        log(room, actingSeat, `${actor.name} uses a Patch Kit, healing ${healed} HP.`);
      }
      return { ok: true };
    }
    case "overdose": {
      const before = actor.hp;
      actor.hp = Math.min(actor.maxHp, actor.hp + 2);
      const healed = actor.hp - before;
      actor.forceLiveNext = true;
      log(room, actingSeat, `${actor.name} takes an Overdose, healing ${healed} HP — but the next shell is forced live.`);
      return { ok: true };
    }
    case "second_wind":
      return { ok: false, error: "Second Wind triggers automatically and can't be used directly." };
  }
}

export function playItem(
  room: RoomState,
  actingSeat: SeatId,
  item: ItemId,
  targetSeat?: SeatId,
): ActionResult {
  if (room.phase !== "playing") return { ok: false, error: "Game is not in progress." };
  if (room.turn !== actingSeat) return { ok: false, error: "It's not your turn." };
  const actor = room.players[actingSeat];
  const idx = actor.items.indexOf(item);
  if (idx === -1) return { ok: false, error: "You don't have that item." };
  if (item === "second_wind") return { ok: false, error: "Second Wind triggers automatically and can't be used directly." };
  actor.items.splice(idx, 1);
  const result = applyItemEffect(room, actingSeat, item, targetSeat);
  room.updatedAt = Date.now();
  return result;
}

export function redact(room: RoomState, forSeat: SeatId): RedactedState {
  const boss = bossSeatOf(room);
  const players = activeSeats(room).map((seat) => {
    const p = room.players[seat];
    const isYou = seat === forSeat;
    return {
      seat,
      name: p.name,
      hp: p.hp,
      maxHp: p.maxHp,
      itemCount: p.items.length,
      items: isYou ? p.items : null,
      connected: p.connected,
      isBot: p.isBot,
      eliminated: p.eliminated,
      team: p.team,
      isBoss: seat === boss,
    };
  });
  return {
    roomId: room.roomId,
    phase: room.phase,
    you: forSeat,
    hostSeat: room.hostSeat,
    settings: room.settings,
    players,
    chamberRemaining: room.chamber.length,
    chamberLiveTotal: room.chamberLiveTotal,
    chamberBlankTotal: room.chamberBlankTotal,
    turn: room.turn,
    round: room.round,
    roundWins: room.roundWins,
    log: room.log,
    privateLog: room.privateLog[forSeat],
    peekedShell: room.peekedShell[forSeat] ?? null,
    winner: room.winner,
  };
}

/* -------------------------------------------------------------------------- */
/* Bot AI                                                                      */
/* -------------------------------------------------------------------------- */

const BOT_MIN_ACTION_DELAY_MS = 550;
const BOT_MAX_ACTION_DELAY_MS = 1050;
export const BOT_STEP_LIMIT = 25;

export function botActionDelayMs(): number {
  return BOT_MIN_ACTION_DELAY_MS + Math.random() * (BOT_MAX_ACTION_DELAY_MS - BOT_MIN_ACTION_DELAY_MS);
}

/**
 * Performs exactly one bot micro-action (an item use, or a shot) and returns which.
 * Callers should keep invoking this in a loop, broadcasting state between calls,
 * while it's still the bot's turn — a blank self-shot legitimately keeps the turn.
 */
export function runBotStep(room: RoomState, botSeat: SeatId): "used_item" | "fired" {
  const bot = room.players[botSeat];
  const others = aliveActiveSeats(room).filter((s) => s !== botSeat && !isTeammate(room, botSeat, s));
  const peeked = room.peekedShell[botSeat] ?? null;
  const { live, blank } = remainingComposition(room);
  const total = live + blank;
  const estLive = peeked ? (peeked === "live" ? 1 : 0) : total > 0 ? live / total : 0;

  // Each micro-action re-rolls against the room's bot skill (0..1). A weak bot
  // simply skips straight to the "fire" fallback below far more often, rather
  // than playing items well — it doesn't forget how the items work, it's just
  // worse at knowing when to use them.
  const skill = room.settings.botSkill ?? 1;
  const smart = Math.random() < skill;

  if (smart) {
    if (bot.items.includes("irons")) {
      const targets = others.filter((s) => !room.players[s].skipNextTurn);
      if (targets.length > 0) {
        playItem(room, botSeat, "irons", targets[randomInt(0, targets.length - 1)]);
        return "used_item";
      }
    }

    if (!peeked && bot.items.includes("loupe")) {
      playItem(room, botSeat, "loupe");
      return "used_item";
    }

    if (peeked === "live" && bot.items.includes("magnum_load") && !bot.tripleDamageNext && !bot.doubleDamageNext) {
      playItem(room, botSeat, "magnum_load");
      return "used_item";
    }

    if (peeked === "live" && bot.items.includes("hacksaw") && !bot.doubleDamageNext && !bot.tripleDamageNext) {
      playItem(room, botSeat, "hacksaw");
      return "used_item";
    }

    const lowHp = bot.hp <= Math.max(1, Math.floor(bot.maxHp * 0.25));
    if (!peeked && lowHp && bot.items.includes("riot_vest") && !bot.shieldedNext) {
      playItem(room, botSeat, "riot_vest");
      return "used_item";
    }
    if (!peeked && lowHp && bot.items.includes("flask")) {
      playItem(room, botSeat, "flask");
      return "used_item";
    }
    if (lowHp && bot.items.includes("overdose")) {
      playItem(room, botSeat, "overdose");
      return "used_item";
    }
    if (bot.hp < bot.maxHp && bot.items.includes("patch_kit") && bot.items.length > 1) {
      playItem(room, botSeat, "patch_kit");
      return "used_item";
    }

    if (bot.items.includes("point_blank") && !bot.forceLiveNext && others.length > 0 && estLive > 0.6) {
      playItem(room, botSeat, "point_blank");
      return "used_item";
    }

    if (bot.items.includes("molotov") && !bot.molotovNext && others.length >= 2 && estLive > 0.5) {
      playItem(room, botSeat, "molotov");
      return "used_item";
    }
  }

  // Already-known information (from a peek) is always honored — no reason to
  // pretend not to know a shell you just looked at, regardless of skill.
  // Only the odds-based guess when nothing is known scales with skill.
  const fireLive = peeked ? peeked === "live" : smart ? estLive > 0.5 : Math.random() < 0.5;
  const target = fireLive && others.length > 0 ? others[randomInt(0, others.length - 1)] : botSeat;
  fire(room, botSeat, target);
  return "fired";
}
