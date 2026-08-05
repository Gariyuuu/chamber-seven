"use client";

import { useEffect, useRef } from "react";
import { LogEntry, PrivateReveal } from "@/lib/game/types";
import { cn } from "@/lib/utils";

type FeedItem =
  | { kind: "public"; id: string; ts: number; content: string }
  | { kind: "private"; id: string; ts: number; content: string };

export function EventLog({ log, privateLog }: { log: LogEntry[]; privateLog: PrivateReveal[] }) {
  const items: FeedItem[] = [
    ...log.map((e) => ({ kind: "public" as const, id: e.id, ts: e.ts, content: e.message })),
    ...privateLog.map((e) => ({ kind: "private" as const, id: e.id, ts: e.ts, content: e.message })),
  ].sort((a, b) => a.ts - b.ts);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [items.length]);

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <p className="border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Table talk
      </p>
      <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2 text-sm">
        {items.map((item) => (
          <p
            key={item.id}
            className={cn(
              item.kind === "private"
                ? "rounded border border-accent/40 bg-accent/10 px-2 py-1 text-accent-foreground/90"
                : "text-muted-foreground",
            )}
          >
            {item.content}
          </p>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
