const HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "127.0.0.1:8787";

function isLocalHost(host: string): boolean {
  return (
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1:") ||
    host.startsWith("192.168.") ||
    host.startsWith("10.")
  );
}

export const LEADERBOARD_URL = `${isLocalHost(HOST) ? "http" : "https"}://${HOST}/leaderboard`;

export interface LeaderboardEntry {
  name: string;
  wins: number;
  lastWinAt: number;
}
