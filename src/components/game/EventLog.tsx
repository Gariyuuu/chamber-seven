"use client";

import { useEffect, useRef } from "react";
import { LogEntry, PrivateReveal } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { ScrollText } from "lucide-react";

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
    <div className="flex h-full flex-col rounded-lg border border-border/80 bg-[oklch(0.1_0.01_30)] shadow-inner">
      <p className="flex items-center gap-1.5 border-b border-border/80 px-3 py-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <ScrollText className="size-3.5 text-primary/70" />
        Table talk
      </p>
      <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2 font-mono text-[0.8rem] leading-relaxed">
        {items.map((item, i) => {
          const isNewest = i === items.length - 1;
          return (
            <p
              key={item.id}
              style={{ animationDelay: isNewest ? "0ms" : undefined }}
              className={cn(
                item.kind === "private" ? "table-talk__row--private" : "table-talk__row",
                item.kind === "private"
                  ? "rounded border-l-2 border-accent bg-accent/10 px-2 py-1 text-accent-foreground/90"
                  : "text-muted-foreground",
                isNewest && "text-foreground/90",
              )}
            >
              {item.kind === "public" && <span className="table-talk__bullet text-primary/50">›&nbsp;</span>}
              {item.content}
            </p>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
