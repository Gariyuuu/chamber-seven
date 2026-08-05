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
  | "silver_tongue";

export type SeatId = "p1" | "p2";

export type GamePhase = "lobby" | "playing" | "match_end";

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
  connected: boolean;
  disconnectedAt: number | null;
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
  players: Record<SeatId, PlayerState>;
  chamber: ShellType[];
  chamberLiveTotal: number;
  chamberBlankTotal: number;
  turn: SeatId;
  round: number;
  roundsToWin: number;
  roundWins: Record<SeatId, number>;
  log: LogEntry[];
  privateLog: Record<SeatId, PrivateReveal[]>;
  peekedShell: Partial<Record<SeatId, ShellType>>;
  bonusDrawFor: SeatId | null;
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
}

export interface RedactedState {
  roomId: string;
  phase: GamePhase;
  you: SeatId;
  hostSeat: SeatId;
  players: Record<SeatId, RedactedPlayer>;
  chamberRemaining: number;
  chamberLiveTotal: number;
  chamberBlankTotal: number;
  turn: SeatId;
  round: number;
  roundsToWin: number;
  roundWins: Record<SeatId, number>;
  log: LogEntry[];
  privateLog: PrivateReveal[];
  peekedShell: ShellType | null;
  winner: SeatId | null;
}

export type ClientMessage =
  | { type: "join"; name: string; token?: string }
  | { type: "start_game" }
  | { type: "use_item"; item: ItemId }
  | { type: "fire"; target: "self" | "opponent" }
  | { type: "rematch" }
  | { type: "leave" };

export type ServerMessage =
  | { type: "welcome"; seat: SeatId; token: string }
  | { type: "state"; state: RedactedState }
  | { type: "error"; message: string };

export function otherSeat(seat: SeatId): SeatId {
  return seat === "p1" ? "p2" : "p1";
}
