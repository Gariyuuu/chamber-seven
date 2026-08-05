import { DurableObject } from "cloudflare:workers";

export interface LeaderboardEntry {
  name: string;
  wins: number;
  lastWinAt: number;
}

const STORAGE_KEY = "entries";
const MAX_TRACKED_NAMES = 500;
const MAX_NAME_LENGTH = 20;

export class Leaderboard extends DurableObject<Env> {
  private async getEntries(): Promise<Record<string, LeaderboardEntry>> {
    return (await this.ctx.storage.get<Record<string, LeaderboardEntry>>(STORAGE_KEY)) ?? {};
  }

  async recordWin(name: string): Promise<void> {
    const trimmed = name.trim().slice(0, MAX_NAME_LENGTH);
    if (!trimmed) return;
    const key = trimmed.toLowerCase();

    const entries = await this.getEntries();
    const existing = entries[key];
    entries[key] = {
      name: existing?.name ?? trimmed,
      wins: (existing?.wins ?? 0) + 1,
      lastWinAt: Date.now(),
    };

    const keys = Object.keys(entries);
    if (keys.length > MAX_TRACKED_NAMES) {
      const leastWins = keys.reduce((a, b) => (entries[a].wins <= entries[b].wins ? a : b));
      delete entries[leastWins];
    }

    await this.ctx.storage.put(STORAGE_KEY, entries);
  }

  async getTop(limit = 20): Promise<LeaderboardEntry[]> {
    const entries = await this.getEntries();
    return Object.values(entries)
      .sort((a, b) => b.wins - a.wins || b.lastWinAt - a.lastWinAt)
      .slice(0, limit);
  }
}
