import { routePartykitRequest, Server, type Connection, type WSMessage } from "partyserver";
import {
  addSystemLog,
  BOT_STEP_LIMIT,
  botActionDelayMs,
  claimSeat,
  createRoom,
  fillBotSeat,
  fire,
  isBotTurn,
  markDisconnected,
  RECONNECT_GRACE_MS,
  redact,
  runBotStep,
  startGame,
  playItem as applyItem,
} from "../src/lib/game/state";
import { ClientMessage, otherSeat, RoomState, SeatId } from "../src/lib/game/types";

const STORAGE_KEY = "room";

export class Main extends Server<Env> {
  private async getState(): Promise<RoomState> {
    const existing = await this.ctx.storage.get<RoomState>(STORAGE_KEY);
    if (existing) return existing;
    const fresh = createRoom(this.name);
    await this.ctx.storage.put(STORAGE_KEY, fresh);
    return fresh;
  }

  private async saveState(state: RoomState) {
    state.updatedAt = Date.now();
    await this.ctx.storage.put(STORAGE_KEY, state);
  }

  private seatFor(state: RoomState, connId: string): SeatId | null {
    if (state.players.p1.connId === connId) return "p1";
    if (state.players.p2.connId === connId) return "p2";
    return null;
  }

  private send(conn: Connection, msg: unknown) {
    conn.send(JSON.stringify(msg));
  }

  private broadcastState(state: RoomState) {
    for (const seat of ["p1", "p2"] as SeatId[]) {
      const connId = state.players[seat].connId;
      if (!connId) continue;
      const conn = this.getConnection(connId);
      if (conn) this.send(conn, { type: "state", state: redact(state, seat) });
    }
  }

  async onMessage(sender: Connection, message: WSMessage) {
    if (typeof message !== "string") return;
    let msg: ClientMessage;
    try {
      msg = JSON.parse(message);
    } catch {
      return;
    }

    const state = await this.getState();

    if (msg.type === "join") {
      const result = claimSeat(state, sender.id, msg.name, msg.token);
      if ("error" in result) {
        this.send(sender, { type: "error", message: result.error });
        return;
      }
      const seat = result.seat;
      addSystemLog(state, `${state.players[seat].name} joined the room.`);
      if (msg.vsAI && seat === "p1" && !state.players.p2.isBot && !state.players.p2.connected) {
        fillBotSeat(state);
      }
      await this.saveState(state);
      this.send(sender, { type: "welcome", seat, token: state.players[seat].token });
      this.broadcastState(state);
      return;
    }

    const seat = this.seatFor(state, sender.id);
    if (!seat) {
      this.send(sender, { type: "error", message: "You have not joined this room." });
      return;
    }

    switch (msg.type) {
      case "start_game": {
        if (state.phase !== "lobby") {
          this.send(sender, { type: "error", message: "Game already started." });
          return;
        }
        if (!state.players.p1.connected || !state.players.p2.connected) {
          this.send(sender, { type: "error", message: "Waiting for both players." });
          return;
        }
        startGame(state);
        break;
      }
      case "fire": {
        const result = fire(state, seat, msg.target);
        if (!result.ok) {
          this.send(sender, { type: "error", message: result.error });
          return;
        }
        break;
      }
      case "use_item": {
        const result = applyItem(state, seat, msg.item);
        if (!result.ok) {
          this.send(sender, { type: "error", message: result.error });
          return;
        }
        break;
      }
      case "rematch": {
        if (state.phase !== "match_end") {
          this.send(sender, { type: "error", message: "Match is not over." });
          return;
        }
        state.phase = "lobby";
        addSystemLog(state, "Rematch! Ready up when you are.");
        break;
      }
      case "leave": {
        markDisconnected(state, seat);
        addSystemLog(state, `${state.players[seat].name} left the room.`);
        break;
      }
    }

    await this.saveState(state);
    this.broadcastState(state);
    await this.runBotIfNeeded(state);
  }

  private async runBotIfNeeded(state: RoomState) {
    let steps = 0;
    while (state.phase === "playing" && isBotTurn(state) && steps++ < BOT_STEP_LIMIT) {
      await new Promise((resolve) => setTimeout(resolve, botActionDelayMs()));
      runBotStep(state, state.turn);
      await this.saveState(state);
      this.broadcastState(state);
    }
  }

  async onClose(conn: Connection) {
    const state = await this.getState();
    const seat = this.seatFor(state, conn.id);
    if (seat && state.players[seat].connected) {
      markDisconnected(state, seat);
      addSystemLog(state, `${state.players[seat].name} disconnected.`);
      if (state.phase === "playing") {
        await this.ctx.storage.setAlarm(Date.now() + RECONNECT_GRACE_MS);
      }
      await this.saveState(state);
      this.broadcastState(state);
    }
  }

  async onAlarm() {
    const state = await this.getState();
    if (state.phase !== "playing") return;
    let changed = false;
    for (const seat of ["p1", "p2"] as SeatId[]) {
      const p = state.players[seat];
      if (!p.connected && p.disconnectedAt && Date.now() - p.disconnectedAt >= RECONNECT_GRACE_MS) {
        const winner = otherSeat(seat);
        state.phase = "match_end";
        state.winner = winner;
        addSystemLog(state, `${p.name} did not reconnect in time. ${state.players[winner].name} wins by forfeit.`);
        changed = true;
      }
    }
    if (changed) {
      await this.saveState(state);
      this.broadcastState(state);
    }
  }
}

export default {
  async fetch(request: Request, env: Env) {
    return (
      (await routePartykitRequest(request, env)) ?? new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
