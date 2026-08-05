"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateRoomCode, isValidRoomCode } from "@/lib/roomCode";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const NAME_KEY = "chamber-seven:name";

export default function HomePage() {
  const router = useRouter();
  const [storedName, setStoredName] = useLocalStorage(NAME_KEY);
  const name = storedName ?? "";
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);

  function requireName(): boolean {
    if (!name.trim()) {
      setJoinError("Enter a name first.");
      return false;
    }
    return true;
  }

  function handleHost() {
    if (!requireName()) return;
    const code = generateRoomCode();
    router.push(`/room/${code}`);
  }

  function handleJoin() {
    if (!requireName()) return;
    const code = joinCode.trim().toUpperCase();
    if (!isValidRoomCode(code)) {
      setJoinError("That doesn't look like a valid table code.");
      return;
    }
    router.push(`/room/${code}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-16">
      <div className="text-center">
        <h1 className="font-display text-7xl tracking-wide text-primary sm:text-8xl">
          CHAMBER&nbsp;SEVEN
        </h1>
        <p className="mt-3 max-w-md text-balance text-muted-foreground">
          One shotgun. A hidden order of live and blank shells. A pocket full of dirty tricks.
          Two players, one survivor.
        </p>
      </div>

      <div className="w-full max-w-sm">
        <label className="mb-2 block text-sm font-medium text-muted-foreground" htmlFor="name">
          Your name
        </label>
        <Input
          id="name"
          placeholder="What do they call you?"
          value={name}
          maxLength={20}
          onChange={(e) => setStoredName(e.target.value)}
        />
      </div>

      <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Host a Table</CardTitle>
            <CardDescription>Open a new room and send the code to your opponent.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg" onClick={handleHost}>
              New Table
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Join a Table</CardTitle>
            <CardDescription>Enter the code your opponent sent you.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              placeholder="CODE"
              value={joinCode}
              maxLength={12}
              className="uppercase"
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            <Button size="lg" onClick={handleJoin}>
              Join
            </Button>
          </CardContent>
        </Card>
      </div>

      {joinError && <p className="text-sm text-destructive">{joinError}</p>}
    </main>
  );
}
