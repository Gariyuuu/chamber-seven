"use client";

import { useParams, useSearchParams } from "next/navigation";
import { GameRoom } from "@/components/game/GameRoom";

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const searchParams = useSearchParams();
  const roomId = (params.roomId ?? "").toUpperCase();
  const vsAI = searchParams.get("ai") === "1";

  if (!roomId) return null;

  return <GameRoom roomId={roomId} vsAI={vsAI} />;
}
