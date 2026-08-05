"use client";

import { useParams } from "next/navigation";
import { GameRoom } from "@/components/game/GameRoom";

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = (params.roomId ?? "").toUpperCase();

  if (!roomId) return null;

  return <GameRoom roomId={roomId} />;
}
