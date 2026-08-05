import { ShellType } from "@/lib/game/types";
import { cn } from "@/lib/utils";

export function ChamberBar({
  remaining,
  liveTotal,
  blankTotal,
  peeked,
}: {
  remaining: number;
  liveTotal: number;
  blankTotal: number;
  peeked: ShellType | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Loaded: <span className="text-primary">{liveTotal} live</span> ·{" "}
          <span className="text-foreground">{blankTotal} blank</span>
        </p>
        <p className="text-sm text-muted-foreground">{remaining} shell{remaining === 1 ? "" : "s"} left</p>
      </div>
      <div className="mt-2.5 flex gap-1.5">
        {Array.from({ length: remaining }).map((_, i) => {
          const known = i === 0 ? peeked : null;
          return (
            <span
              key={i}
              className={cn(
                "h-7 w-3.5 rounded-full border border-black/20 transition-transform duration-300",
                known === "live" && "shell-pip-live scale-110",
                known === "blank" && "shell-pip-blank scale-110",
                !known && "shell-pip",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
