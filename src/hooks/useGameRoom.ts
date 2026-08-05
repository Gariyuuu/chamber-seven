"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import usePartySocket from "partysocket/react";
import { ClientMessage, GameSettings, ItemId, RedactedState, SeatId, ServerMessage } from "@/lib/game/types";

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "127.0.0.1:1999";

function tokenKey(roomId: string) {
  return `chamber-seven:token:${roomId}`;
}

export function useGameRoom(
  roomId: string,
  name: string,
  vsAI = false,
  initialSettings?: GameSettings,
) {
  const [seat, setSeat] = useState<SeatId | null>(null);
  const [state, setState] = useState<RedactedState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const nameRef = useRef(name);
  const vsAIRef = useRef(vsAI);
  const settingsRef = useRef(initialSettings);
  useEffect(() => {
    nameRef.current = name;
    vsAIRef.current = vsAI;
    settingsRef.current = initialSettings;
  }, [name, vsAI, initialSettings]);

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: roomId.toLowerCase(),
    onOpen() {
      setConnected(true);
      const token = typeof window !== "undefined" ? localStorage.getItem(tokenKey(roomId)) ?? undefined : undefined;
      send({ type: "join", name: nameRef.current, token, vsAI: vsAIRef.current, settings: settingsRef.current });
    },
    onClose() {
      setConnected(false);
    },
    onMessage(event) {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      if (msg.type === "welcome") {
        setSeat(msg.seat);
        if (typeof window !== "undefined") {
          localStorage.setItem(tokenKey(roomId), msg.token);
        }
        setError(null);
      } else if (msg.type === "state") {
        setState(msg.state);
      } else if (msg.type === "error") {
        setError(msg.message);
      }
    },
  });

  const send = useCallback(
    (msg: ClientMessage) => {
      socket.send(JSON.stringify(msg));
    },
    [socket],
  );

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  return {
    seat,
    state,
    error,
    connected,
    startGame: () => send({ type: "start_game" }),
    fireAt: (target: SeatId) => send({ type: "fire", target }),
    useItem: (item: ItemId, target?: SeatId) => send({ type: "use_item", item, target }),
    rematch: () => send({ type: "rematch" }),
    leave: () => send({ type: "leave" }),
  };
}
