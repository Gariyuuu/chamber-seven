export type ShellType = "live" | "blank";

export type ItemId =
  | "loupe"
  | "irons"
  | "hacksaw"
  | "flask"
  | "adrenal_shot"
  | "marked_bullet"
  | "counterfeit_chip"
  | "smoke_bomb"
  | "second_wind"
  | "silver_tongue"
  | "riot_vest"
  | "molotov"
  | "vultures_due"
  | "false_confession"
  | "loaded_dice"
  | "bribe"
  | "point_blank"
  | "sleight_of_hand"
  | "last_rites"
  | "scapegoat"
  | "magnum_load"
  | "patch_kit";

export type SeatId = "p1" | "p2" | "p3" | "p4";
export const ALL_SEATS: SeatId[] = ["p1", "p2", "p3", "p4"];

export type GamePhase = "lobby" | "playing" | "match_end";

/**
 * "none" — free-for-all, every seat for themselves (default).
 * "duos" — 2v2, requires exactly 4 players. Seats alternate p1+p3 vs p2+p4.
 * "boss" — every player vs the last seat, who gets bonus HP and item draws.
 */
export type TeamMode = "none" | "duos" | "boss";

export interface GameSettings {
  playerCount: 2 | 3 | 4;
  /** Round wins needed to take the match: 1 = best of 1, 2 = best of 3, 3 = best of 5. Forced to 1 when teamMode isn't "none". */
  roundsToWin: 1 | 2 | 3;
  hpMin: number;
  hpMax: number;
  itemsPerReload: number;
  /** Which items can be drawn this match. Must be non-empty. */
  enabledItems: ItemId[];
  /** 0..1 — how often bots in this room make the "smart" decision. 1 = full strength (default). */
  botSkill: number;
  teamMode: TeamMode;
}

export interface PlayerState {
  seat: SeatId;
  connId: string | null;
  token: string;
  name: string;
  hp: number;
  maxHp: number;
  items: ItemId[];
  skipNextTurn: boolean;
  doubleDamageNext: boolean;
  tripleDamageNext: boolean;
  forceLiveNext: boolean;
  shieldedNext: boolean;
  molotovNext: boolean;
  redirectTo: SeatId | null;
  connected: boolean;
  disconnectedAt: number | null;
  isBot: boolean;
  eliminated: boolean;
  /** 0 or 1 in team modes, null in free-for-all. */
  team: 0 | 1 | null;
}

export interface LogEntry {
  id: string;
  ts: number;
  seat: SeatId | null;
  message: string;
}

export interface PrivateReveal {
  id: string;
  ts: number;
  message: string;
}

export interface RoomState {
  roomId: string;
  phase: GamePhase;
  hostSeat: SeatId;
  settings: GameSettings;
  settingsLocked: boolean;
  players: Record<SeatId, PlayerState>;
  chamber: ShellType[];
  chamberLiveTotal: number;
  chamberBlankTotal: number;
  turn: SeatId;
  round: number;
  roundWins: Record<SeatId, number>;
  log: LogEntry[];
  privateLog: Record<SeatId, PrivateReveal[]>;
  peekedShell: Partial<Record<SeatId, ShellType>>;
  bonusDrawFor: SeatId | null;
  /** Whether a Scapegoat has ever been drawn this match — capped at one per game, not per round. */
  scapegoatEverDrawn: boolean;
  /** Guards against recording the same match_end to the leaderboard more than once. */
  winnerRecorded: boolean;
  winner: SeatId | null;
  createdAt: number;
  updatedAt: number;
}

export interface RedactedPlayer {
  seat: SeatId;
  name: string;
  hp: number;
  maxHp: number;
  itemCount: number;
  items: ItemId[] | null;
  connected: boolean;
  isBot: boolean;
  eliminated: boolean;
  team: 0 | 1 | null;
  isBoss: boolean;
}

export interface RedactedState {
  roomId: string;
  phase: GamePhase;
  you: SeatId;
  hostSeat: SeatId;
  settings: GameSettings;
  players: RedactedPlayer[];
  chamberRemaining: number;
  chamberLiveTotal: number;
  chamberBlankTotal: number;
  turn: SeatId;
  round: number;
  roundWins: Record<SeatId, number>;
  log: LogEntry[];
  privateLog: PrivateReveal[];
  peekedShell: ShellType | null;
  winner: SeatId | null;
}

export type ClientMessage =
  | { type: "join"; name: string; token?: string; vsAI?: boolean; settings?: GameSettings; botName?: string }
  | { type: "start_game" }
  | { type: "use_item"; item: ItemId; target?: SeatId }
  | { type: "fire"; target: SeatId }
  | { type: "rematch" }
  | { type: "leave" };

export type ServerMessage =
  | { type: "welcome"; seat: SeatId; token: string }
  | { type: "state"; state: RedactedState }
  | { type: "error"; message: string };
